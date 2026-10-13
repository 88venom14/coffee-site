package repositories

import (
	"context"
	"errors"
	"math"

	"kin-coffee/backend/internal/models"

	"github.com/jackc/pgx/v5"
)

func (p *Postgres) CreateOrder(ctx context.Context, userID string, input models.CheckoutInput) (models.Order, error) {
	tx, err := p.db.Begin(ctx)
	if err != nil {
		return models.Order{}, err
	}
	defer tx.Rollback(ctx)

	var cartID int64
	err = tx.QueryRow(ctx,
		`SELECT id FROM carts WHERE user_id=$1 FOR UPDATE`, userID,
	).Scan(&cartID)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Order{}, ErrCartEmpty
	}
	if err != nil {
		return models.Order{}, err
	}

	rows, err := tx.Query(ctx,
		`SELECT p.id, p.name, p.price::float8, ci.quantity
		 FROM cart_items ci
		 JOIN products p ON p.id=ci.product_id
		 WHERE ci.cart_id=$1 AND p.is_available
		 FOR UPDATE OF p`, cartID,
	)
	if err != nil {
		return models.Order{}, err
	}

	type orderLine struct {
		productID int64
		name      string
		price     float64
		quantity  int
	}
	lines := make([]orderLine, 0)
	totalCents := int64(0)
	for rows.Next() {
		var line orderLine
		if err := rows.Scan(&line.productID, &line.name, &line.price, &line.quantity); err != nil {
			rows.Close()
			return models.Order{}, err
		}
		lines = append(lines, line)
		totalCents += int64(math.Round(line.price*100)) * int64(line.quantity)
	}
	if err := rows.Err(); err != nil {
		rows.Close()
		return models.Order{}, err
	}
	rows.Close()
	if len(lines) == 0 {
		return models.Order{}, ErrCartEmpty
	}

	total := float64(totalCents) / 100
	var orderID int64
	err = tx.QueryRow(ctx,
		`INSERT INTO orders(
			user_id, status, customer_name, customer_email, customer_phone,
			order_type, delivery_address, total_price
		) VALUES($1, 'placed', $2, $3, $4, $5, $6, $7)
		RETURNING id`,
		userID, input.Name, input.Email, input.Phone, input.OrderType, input.Address, total,
	).Scan(&orderID)
	if err != nil {
		return models.Order{}, err
	}

	for _, line := range lines {
		_, err = tx.Exec(ctx,
			`INSERT INTO order_items(order_id, product_id, product_name, unit_price, quantity)
			 VALUES($1, $2, $3, $4, $5)`,
			orderID, line.productID, line.name, line.price, line.quantity,
		)
		if err != nil {
			return models.Order{}, err
		}
	}

	if _, err := tx.Exec(ctx, `DELETE FROM cart_items WHERE cart_id=$1`, cartID); err != nil {
		return models.Order{}, err
	}
	if err := tx.Commit(ctx); err != nil {
		return models.Order{}, err
	}

	return models.Order{ID: orderID, Status: "placed", Total: total}, nil
}

func (p *Postgres) Orders(ctx context.Context, userID string) ([]models.Order, error) {
	rows, err := p.db.Query(ctx,
		`SELECT id, status, order_type, total_price::float8, created_at
		 FROM orders WHERE user_id=$1 ORDER BY created_at DESC`, userID,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	orders := make([]models.Order, 0)
	for rows.Next() {
		var order models.Order
		if err := rows.Scan(&order.ID, &order.Status, &order.OrderType, &order.Total, &order.CreatedAt); err != nil {
			return nil, err
		}
		orders = append(orders, order)
	}
	return orders, rows.Err()
}

func (p *Postgres) OrderByID(ctx context.Context, userID string, orderID int64) (models.Order, error) {
	var order models.Order
	err := p.db.QueryRow(ctx,
		`SELECT id, status, order_type, delivery_address, total_price::float8, created_at
		 FROM orders WHERE id=$1 AND user_id=$2`, orderID, userID,
	).Scan(&order.ID, &order.Status, &order.OrderType, &order.Address, &order.Total, &order.CreatedAt)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Order{}, ErrNotFound
	}
	if err != nil {
		return models.Order{}, err
	}

	rows, err := p.db.Query(ctx,
		`SELECT product_name, unit_price::float8, quantity
		 FROM order_items WHERE order_id=$1 ORDER BY id`, orderID,
	)
	if err != nil {
		return models.Order{}, err
	}
	defer rows.Close()

	order.Items = make([]models.OrderItem, 0)
	for rows.Next() {
		var item models.OrderItem
		if err := rows.Scan(&item.Name, &item.Price, &item.Quantity); err != nil {
			return models.Order{}, err
		}
		order.Items = append(order.Items, item)
	}
	return order, rows.Err()
}
