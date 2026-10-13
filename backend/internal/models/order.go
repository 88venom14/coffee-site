package models

import "time"

type CheckoutInput struct {
	OrderType string `json:"orderType"`
	Address   string `json:"address"`
	Name      string `json:"name"`
	Email     string `json:"email"`
	Phone     string `json:"phone"`
}

type OrderItem struct {
	Name     string  `json:"name"`
	Price    float64 `json:"price"`
	Quantity int     `json:"quantity"`
}

type Order struct {
	ID        int64       `json:"id"`
	Status    string      `json:"status"`
	OrderType string      `json:"orderType"`
	Address   string      `json:"address,omitempty"`
	Total     float64     `json:"total"`
	CreatedAt time.Time   `json:"createdAt,omitempty"`
	Items     []OrderItem `json:"items,omitempty"`
}
