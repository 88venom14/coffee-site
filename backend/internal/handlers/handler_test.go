package handlers

import (
	"net/http/httptest"
	"strings"
	"testing"
)

func TestDecodeJSONRejectsMissingContentType(t *testing.T) {
	request := httptest.NewRequest("POST", "/", strings.NewReader(`{"name":"Coffee"}`))
	response := httptest.NewRecorder()
	var input struct {
		Name string `json:"name"`
	}

	if err := decodeJSON(response, request, &input); err == nil {
		t.Fatal("decodeJSON() accepted a request without application/json")
	}
}

func TestDecodeJSONRejectsOversizedBody(t *testing.T) {
	request := httptest.NewRequest("POST", "/", strings.NewReader(`{"name":"`+strings.Repeat("x", 32<<10)+`"}`))
	request.Header.Set("Content-Type", "application/json")
	response := httptest.NewRecorder()
	var input struct {
		Name string `json:"name"`
	}

	if err := decodeJSON(response, request, &input); err == nil {
		t.Fatal("decodeJSON() accepted a body larger than 32 KiB")
	}
}
