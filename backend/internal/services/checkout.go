package services

import (
	"strings"
	"unicode/utf8"

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
	if utf8.RuneCountInString(input.Name) < minNameLength || utf8.RuneCountInString(input.Name) > maxNameLength ||
		!validPhone(input.Phone) {
		return models.CheckoutInput{}, ErrInvalidInput
	}
	if !validEmail(input.Email) {
		return models.CheckoutInput{}, ErrInvalidInput
	}
	if input.OrderType == "delivery" && (utf8.RuneCountInString(input.Address) < 5 || utf8.RuneCountInString(input.Address) > 500) {
		return models.CheckoutInput{}, ErrInvalidInput
	}

	return input, nil
}

func validPhone(phone string) bool {
	if utf8.RuneCountInString(phone) < 5 || utf8.RuneCountInString(phone) > 40 {
		return false
	}

	digits := 0
	for _, character := range phone {
		switch {
		case character >= '0' && character <= '9':
			digits++
		case character == '+' || character == '(' || character == ')' || character == '-' || character == '.' || character == ' ':
		default:
			return false
		}
	}
	return digits >= 5 && digits <= 20
}
