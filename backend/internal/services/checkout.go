package services

import (
	"strings"

	"kin-coffee/backend/internal/models"
)

func ValidateCheckout(input models.CheckoutInput) (models.CheckoutInput, error) {
	input.Name = strings.TrimSpace(input.Name)
	input.Email = strings.ToLower(strings.TrimSpace(input.Email))
	input.Phone = strings.TrimSpace(input.Phone)
	input.Address = strings.TrimSpace(input.Address)

	if input.OrderType != "pickup" && input.OrderType != "delivery" {
		return models.CheckoutInput{}, ErrInvalidInput
	}
	if len(input.Name) < 2 || len(input.Name) > 100 || len(input.Phone) < 5 || len(input.Phone) > 40 {
		return models.CheckoutInput{}, ErrInvalidInput
	}
	if !validEmail(input.Email) {
		return models.CheckoutInput{}, ErrInvalidInput
	}
	if input.OrderType == "delivery" && (len(input.Address) < 5 || len(input.Address) > 500) {
		return models.CheckoutInput{}, ErrInvalidInput
	}

	return input, nil
}
