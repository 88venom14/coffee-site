package handlers

import (
	"strings"
	"testing"

	"kin-coffee/backend/internal/models"
)

func TestValidFiltersRejectsOverlongAndUnknownValues(t *testing.T) {
	tests := []struct {
		name    string
		filters models.ProductFilters
	}{
		{name: "search exceeds limit", filters: models.ProductFilters{Search: strings.Repeat("a", 121)}},
		{name: "unknown category", filters: models.ProductFilters{Category: "unknown-category"}},
		{name: "unknown sort", filters: models.ProductFilters{Sort: "arbitrary-sort"}},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if validFilters(test.filters) {
				t.Fatal("validFilters() accepted invalid values")
			}
		})
	}
}

func TestValidFiltersAcceptsSupportedCategoryAndSearch(t *testing.T) {
	if !validFilters(models.ProductFilters{Category: "coffee", Search: "чёрный кофе"}) {
		t.Fatal("validFilters() rejected supported values")
	}
}
