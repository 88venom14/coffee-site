package repositories

import (
	"context"
	"errors"

	"kin-coffee/backend/internal/models"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

func (p *Postgres) CreateUser(ctx context.Context, name, email, passwordHash string) (models.User, error) {
	tx, err := p.db.Begin(ctx)
	if err != nil {
		return models.User{}, err
	}
	defer tx.Rollback(ctx)

	var user models.User
	err = tx.QueryRow(ctx,
		`INSERT INTO users(name, email, password_hash)
		 VALUES($1, $2, $3)
		 RETURNING id::text, name, email`, name, email, passwordHash,
	).Scan(&user.ID, &user.Name, &user.Email)
	if err != nil {
		var postgresError *pgconn.PgError
		if errors.As(err, &postgresError) && postgresError.Code == "23505" {
			return models.User{}, ErrEmailExists
		}
		return models.User{}, err
	}

	if _, err := tx.Exec(ctx, `INSERT INTO carts(user_id) VALUES($1)`, user.ID); err != nil {
		return models.User{}, err
	}

	if err := tx.Commit(ctx); err != nil {
		return models.User{}, err
	}
	return user, nil
}

func (p *Postgres) UserCredentialsByEmail(ctx context.Context, email string) (models.UserCredentials, error) {
	var credentials models.UserCredentials
	err := p.db.QueryRow(ctx,
		`SELECT id::text, name, email, password_hash FROM users WHERE email=$1`, email,
	).Scan(&credentials.User.ID, &credentials.User.Name, &credentials.User.Email, &credentials.PasswordHash)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.UserCredentials{}, ErrNotFound
	}
	return credentials, err
}

func (p *Postgres) UserByID(ctx context.Context, userID string) (models.User, error) {
	var user models.User
	err := p.db.QueryRow(ctx,
		`SELECT id::text, name, email FROM users WHERE id=$1`, userID,
	).Scan(&user.ID, &user.Name, &user.Email)
	if errors.Is(err, pgx.ErrNoRows) {
		return models.User{}, ErrNotFound
	}
	return user, err
}

func (p *Postgres) CreateSession(ctx context.Context, tokenHash, userID string) error {
	_, err := p.db.Exec(ctx,
		`INSERT INTO sessions(token_hash, user_id, expires_at)
		 VALUES($1, $2, now() + interval '30 days')`, tokenHash, userID,
	)
	return err
}

func (p *Postgres) UserIDBySessionHash(ctx context.Context, tokenHash string) (string, error) {
	var userID string
	err := p.db.QueryRow(ctx,
		`SELECT user_id::text FROM sessions WHERE token_hash=$1 AND expires_at > now()`, tokenHash,
	).Scan(&userID)
	if errors.Is(err, pgx.ErrNoRows) {
		return "", ErrNotFound
	}
	return userID, err
}

func (p *Postgres) DeleteSession(ctx context.Context, tokenHash string) error {
	_, err := p.db.Exec(ctx, `DELETE FROM sessions WHERE token_hash=$1`, tokenHash)
	return err
}
