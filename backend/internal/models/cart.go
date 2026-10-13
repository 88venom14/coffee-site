package models

type CartItem struct {
	ID          int64   `json:"id"`
	ProductID   int64   `json:"productId"`
	Name        string  `json:"name"`
	Description string  `json:"description"`
	Price       float64 `json:"price"`
	ImageURL    string  `json:"imageUrl"`
	Quantity    int     `json:"quantity"`
	Available   bool    `json:"available"`
	Subtotal    float64 `json:"subtotal"`
}

type Cart struct {
	Items    []CartItem `json:"items"`
	Subtotal float64    `json:"subtotal"`
	Delivery float64    `json:"delivery"`
	Total    float64    `json:"total"`
}

type AddCartItemInput struct {
	ProductID int64 `json:"productId"`
	Quantity  int   `json:"quantity"`
}

type UpdateCartItemInput struct {
	Quantity int `json:"quantity"`
}
