package repositories

import (
	"errors"

	"github.com/jackc/pgx/v5/pgxpool"
)

var (
	ErrNotFound    = errors.New("record not found")
	ErrEmailExists = errors.New("email already exists")
	ErrCartEmpty   = errors.New("cart is empty")
	ErrUnavailable = errors.New("product is unavailable")
)

type Postgres struct {
	db *pgxpool.Pool
}

func NewPostgres(db *pgxpool.Pool) *Postgres {
	return &Postgres{db: db}
}
