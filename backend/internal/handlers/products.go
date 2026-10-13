package handlers

import (
	"errors"
	"math"
	"net/http"
	"strconv"
	"strings"
	"unicode/utf8"

	"kin-coffee/backend/internal/models"
	"kin-coffee/backend/internal/repositories"
)

func (h *Handler) ListProducts(w http.ResponseWriter, r *http.Request) {
	query := r.URL.Query()
	filters := models.ProductFilters{
		Search:    strings.TrimSpace(query.Get("search")),
		Category:  strings.TrimSpace(query.Get("category")),
		MinPrice:  query.Get("minPrice"),
		MaxPrice:  query.Get("maxPrice"),
		Available: query.Get("available"),
		Popular:   query.Get("popular"),
		Sort:      query.Get("sort"),
	}
	if !validFilters(filters) {
		WriteError(w, http.StatusBadRequest, "Некоторые фильтры товаров заполнены неверно.")
		return
	}

	products, err := h.repository.Products(r.Context(), filters)
	if err != nil {
		writeInternalError(w, "Не удалось загрузить товары.")
		return
	}
	WriteJSON(w, http.StatusOK, products)
}

func validFilters(filters models.ProductFilters) bool {
	if utf8.RuneCountInString(filters.Search) > 120 || len(filters.Category) > 40 || len(filters.Sort) > 20 {
		return false
	}
	if filters.Category != "" && !oneOf(filters.Category, "coffee", "tea", "cold-drinks", "pastries", "desserts", "accessories") {
		return false
	}
	if filters.Sort != "" && !oneOf(filters.Sort, "price_asc", "price_desc", "newest", "popular") {
		return false
	}
	minPrice, minValid := optionalNonNegativeNumber(filters.MinPrice)
	maxPrice, maxValid := optionalNonNegativeNumber(filters.MaxPrice)
	if !minValid || !maxValid || (filters.MinPrice != "" && filters.MaxPrice != "" && minPrice > maxPrice) {
		return false
	}
	if filters.Available != "" && filters.Available != "true" && filters.Available != "false" {
		return false
	}
	if filters.Popular != "" && filters.Popular != "true" && filters.Popular != "false" {
		return false
	}
	return true
}

func oneOf(value string, allowed ...string) bool {
	for _, option := range allowed {
		if value == option {
			return true
		}
	}
	return false
}

func optionalNonNegativeNumber(value string) (float64, bool) {
	if value == "" {
		return 0, true
	}
	number, err := strconv.ParseFloat(value, 64)
	return number, err == nil && !math.IsNaN(number) && !math.IsInf(number, 0) && number >= 0
}

func (h *Handler) GetProduct(w http.ResponseWriter, r *http.Request) {
	productID, err := strconv.ParseInt(r.PathValue("id"), 10, 64)
	if err != nil || productID < 1 {
		WriteError(w, http.StatusBadRequest, "Некорректный товар.")
		return
	}

	product, err := h.repository.ProductByID(r.Context(), productID)
	if errors.Is(err, repositories.ErrNotFound) {
		WriteError(w, http.StatusNotFound, "Товар не найден.")
		return
	}
	if err != nil {
		writeInternalError(w, "Не удалось загрузить товар.")
		return
	}
	WriteJSON(w, http.StatusOK, product)
}
