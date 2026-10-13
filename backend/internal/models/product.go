package models

import "time"

type Product struct {
	ID           int64     `json:"id"`
	Name         string    `json:"name"`
	Description  string    `json:"description"`
	Price        float64   `json:"price"`
	Category     string    `json:"category"`
	CategorySlug string    `json:"categorySlug"`
	ImageURL     string    `json:"imageUrl"`
	Available    bool      `json:"available"`
	Popular      bool      `json:"popular"`
	CreatedAt    time.Time `json:"createdAt"`
}

type ProductFilters struct {
	Search    string
	Category  string
	MinPrice  string
	MaxPrice  string
	Available string
	Popular   string
	Sort      string
}
