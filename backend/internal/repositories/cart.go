package repositories

import (
	"context"

	"kin-coffee/backend/internal/models"
)

func (p *Postgres) Cart(ctx context.Context, userID string) (models.Cart, error) {
	rows, err := p.db.Query(ctx,
		`SELECT ci.id, p.id, p.name, p.description, p.price::float8,
		 p.image_url, ci.quantity, p.is_available, (p.price * ci.quantity)::float8
		 FROM carts c
		 JOIN cart_items ci ON ci.cart_id = c.id
		 JOIN products p ON p.id = ci.product_id
		 WHERE c.user_id=$1
		 ORDER BY ci.id`, userID,
	)
	if err != nil {
		return models.Cart{}, err
	}
	defer rows.Close()

	cart := models.Cart{Items: make([]models.CartItem, 0)}
	for rows.Next() {
		var item models.CartItem
		if err := rows.Scan(
			&item.ID, &item.ProductID, &item.Name, &item.Description,
			&item.Price, &item.ImageURL, &item.Quantity, &item.Available, &item.Subtotal,
		); err != nil {
			return models.Cart{}, err
		}
		cart.Items = append(cart.Items, item)
		cart.Subtotal += item.Subtotal
	}
	cart.Total = cart.Subtotal + cart.Delivery
	return cart, rows.Err()
}

func (p *Postgres) AddCartItem(ctx context.Context, userID string, productID int64, quantity int) error {
	tag, err := p.db.Exec(ctx,
		`INSERT INTO cart_items(cart_id, product_id, quantity)
		 SELECT id, $2, $3 FROM carts
		 WHERE user_id=$1
		   AND EXISTS (SELECT 1 FROM products WHERE id=$2 AND is_available)
		 ON CONFLICT(cart_id, product_id)
		 DO UPDATE SET quantity=LEAST(99, cart_items.quantity + EXCLUDED.quantity)`,
		userID, productID, quantity,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrUnavailable
	}
	return nil
}

func (p *Postgres) UpdateCartItem(ctx context.Context, userID string, itemID int64, quantity int) error {
	tag, err := p.db.Exec(ctx,
		`UPDATE cart_items ci SET quantity=$1
		 FROM carts c
		 WHERE ci.cart_id=c.id AND c.user_id=$2 AND ci.id=$3`,
		quantity, userID, itemID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (p *Postgres) RemoveCartItem(ctx context.Context, userID string, itemID int64) error {
	tag, err := p.db.Exec(ctx,
		`DELETE FROM cart_items ci
		 USING carts c
		 WHERE ci.cart_id=c.id AND c.user_id=$1 AND ci.id=$2`, userID, itemID,
	)
	if err != nil {
		return err
	}
	if tag.RowsAffected() == 0 {
		return ErrNotFound
	}
	return nil
}

func (p *Postgres) ClearCart(ctx context.Context, userID string) error {
	_, err := p.db.Exec(ctx,
		`DELETE FROM cart_items ci USING carts c
		 WHERE ci.cart_id=c.id AND c.user_id=$1`, userID,
	)
	return err
}
