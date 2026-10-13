package middleware

import (
	"net/http"
	"net/http/httptest"
	"testing"
	"time"
)

func TestIPRateLimitRejectsRequestsAfterLimit(t *testing.T) {
	limited := IPRateLimit(2, time.Minute)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))

	for attempt := 1; attempt <= 3; attempt++ {
		request := httptest.NewRequest(http.MethodPost, "/api/auth/login", nil)
		request.RemoteAddr = "192.0.2.10:12345"
		response := httptest.NewRecorder()
		limited.ServeHTTP(response, request)

		if attempt <= 2 && response.Code != http.StatusNoContent {
			t.Fatalf("request %d status = %d, want %d", attempt, response.Code, http.StatusNoContent)
		}
		if attempt == 3 {
			if response.Code != http.StatusTooManyRequests {
				t.Fatalf("request %d status = %d, want %d", attempt, response.Code, http.StatusTooManyRequests)
			}
			if response.Header().Get("Retry-After") == "" {
				t.Fatal("rate-limited response is missing Retry-After")
			}
		}
	}
}

func TestIPRateLimitSeparatesClientAddresses(t *testing.T) {
	limited := IPRateLimit(1, time.Minute)(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	for _, address := range []string{"192.0.2.10:12345", "192.0.2.11:12345"} {
		request := httptest.NewRequest(http.MethodPost, "/api/auth/login", nil)
		request.RemoteAddr = address
		response := httptest.NewRecorder()
		limited.ServeHTTP(response, request)
		if response.Code != http.StatusNoContent {
			t.Fatalf("request from %s status = %d, want %d", address, response.Code, http.StatusNoContent)
		}
	}
}

func TestSecurityHeadersAreSet(t *testing.T) {
	handler := SecurityHeaders(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/", nil))

	if response.Header().Get("X-Content-Type-Options") != "nosniff" {
		t.Fatal("X-Content-Type-Options was not set")
	}
	if response.Header().Get("X-Frame-Options") != "DENY" {
		t.Fatal("X-Frame-Options was not set")
	}
}
