package services

import (
	"testing"

	"kin-coffee/backend/internal/models"
)

func TestValidateCheckoutAcceptsPickup(t *testing.T) {
	input := models.CheckoutInput{
		OrderType: "pickup",
		Name:      "Alex Example",
		Email:     "alex@example.com",
		Phone:     "+353 800 123 456",
	}

	validated, err := ValidateCheckout(input)
	if err != nil {
		t.Fatalf("ValidateCheckout() returned an unexpected error: %v", err)
	}
	if validated.Name != input.Name || validated.Email != input.Email || validated.OrderType != input.OrderType {
		t.Fatalf("ValidateCheckout() = %#v, want the input details to be preserved", validated)
	}
}

func TestValidateCheckoutRequiresDeliveryAddress(t *testing.T) {
	input := models.CheckoutInput{
		OrderType: "delivery",
		Name:      "Alex Example",
		Email:     "alex@example.com",
		Phone:     "+353 800 123 456",
	}

	if _, err := ValidateCheckout(input); err != ErrInvalidInput {
		t.Fatalf("ValidateCheckout() error = %v, want %v", err, ErrInvalidInput)
	}
}

func TestValidateCheckoutTrimsAndNormalizesContactDetails(t *testing.T) {
	input := models.CheckoutInput{
		OrderType: "delivery",
		Address:   "  12 Market Street  ",
		Name:      "  Alex Example  ",
		Email:     "  ALEX@EXAMPLE.COM  ",
		Phone:     "  +353 800 123 456  ",
	}

	validated, err := ValidateCheckout(input)
	if err != nil {
		t.Fatalf("ValidateCheckout() returned an unexpected error: %v", err)
	}
	if validated.Name != "Alex Example" || validated.Email != "alex@example.com" || validated.Address != "12 Market Street" {
		t.Fatalf("ValidateCheckout() did not normalize details: %#v", validated)
	}
}
