package repositories

import (
	"context"
	"errors"
	"fmt"

	"kin-coffee/backend/internal/models"

	"github.com/jackc/pgx/v5"
)

const productFields = `p.id, p.name, p.description, p.price::float8,
	c.name, c.slug, p.image_url, p.is_available, p.is_popular, p.created_at`

func (p *Postgres) Products(ctx context.Context, filters models.ProductFilters) ([]models.Product, error) {
	orderBy := "p.is_popular DESC, p.created_at DESC"
	switch filters.Sort {
	case "price_asc":
		orderBy = "p.price ASC"
	case "price_desc":
		orderBy = "p.price DESC"
	case "newest":
		orderBy = "p.created_at DESC"
	case "popular":
		orderBy = "p.is_popular DESC, p.created_at DESC"
	}

	query := fmt.Sprintf(`SELECT %s
		FROM products p
		JOIN categories c ON c.id = p.category_id
		WHERE p.name ILIKE $1
		  AND ($2 = '' OR c.slug = $2)
		  AND ($3 = '' OR p.price >= NULLIF($3, '')::numeric)
		  AND ($4 = '' OR p.price <= NULLIF($4, '')::numeric)
		  AND ($5 = '' OR p.is_available = NULLIF($5, '')::boolean)
		  AND ($6 = '' OR p.is_popular = NULLIF($6, '')::boolean)
		ORDER BY %s`, productFields, orderBy)

	rows, err := p.db.Query(ctx, query,
		"%"+filters.Search+"%", filters.Category, filters.MinPrice,
		filters.MaxPrice, filters.Available, filters.Popular,
	)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	products := make([]models.Product, 0)
	for rows.Next() {
		var product models.Product
		if err := rows.Scan(
			&product.ID, &product.Name, &product.Description, &product.Price,
			&product.Category, &product.CategorySlug, &product.ImageURL,
			&product.Available, &product.Popular, &product.CreatedAt,
		); err != nil {
			return nil, err
		}
		products = append(products, product)
	}
	return products, rows.Err()
}

func (p *Postgres) ProductByID(ctx context.Context, id int64) (models.Product, error) {
	var product models.Product
	err := p.db.QueryRow(ctx,
		`SELECT `+productFields+`
		 FROM products p
		 JOIN categories c ON c.id = p.category_id
		 WHERE p.id=$1`, id,
	).Scan(
		&product.ID, &product.Name, &product.Description, &product.Price,
		&product.Category, &product.CategorySlug, &product.ImageURL,
		&product.Available, &product.Popular, &product.CreatedAt,
	)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.Product{}, ErrNotFound
	}
	return product, err
}
