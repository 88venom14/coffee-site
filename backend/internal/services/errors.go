package services

import "errors"

var (
	ErrInvalidInput = errors.New("invalid input")
	ErrUnauthorized = errors.New("unauthorized")
	ErrEmailTaken   = errors.New("email already exists")
)
