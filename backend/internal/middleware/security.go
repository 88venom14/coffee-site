package middleware

import (
	"math"
	"net"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"kin-coffee/backend/internal/httpresponse"
)

const maxTrackedClients = 10000

type rateLimitEntry struct {
	windowStart time.Time
	requests    int
}

type ipRateLimiter struct {
	mu          sync.Mutex
	entries     map[string]rateLimitEntry
	requests    uint64
	maxRequests int
	window      time.Duration
}

func IPRateLimit(maxRequests int, window time.Duration) func(http.Handler) http.Handler {
	limiter := &ipRateLimiter{
		entries:     make(map[string]rateLimitEntry),
		maxRequests: maxRequests,
		window:      window,
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if maxRequests < 1 || window <= 0 {
				next.ServeHTTP(w, r)
				return
			}

			if retryAfter := limiter.retryAfter(clientIP(r.RemoteAddr), time.Now()); retryAfter > 0 {
				w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
				httpresponse.Error(w, http.StatusTooManyRequests, "Слишком много попыток. Попробуйте позже.")
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func (l *ipRateLimiter) retryAfter(client string, now time.Time) int {
	l.mu.Lock()
	defer l.mu.Unlock()

	l.requests++
	if l.requests%128 == 0 {
		for ip, entry := range l.entries {
			if now.Sub(entry.windowStart) >= l.window {
				delete(l.entries, ip)
			}
		}
	}

	entry, exists := l.entries[client]
	if !exists || now.Sub(entry.windowStart) >= l.window {
		if !exists && len(l.entries) >= maxTrackedClients {
			return int(math.Ceil(l.window.Seconds()))
		}
		entry = rateLimitEntry{windowStart: now}
	}
	if entry.requests >= l.maxRequests {
		return max(1, int(math.Ceil(l.window.Seconds()-now.Sub(entry.windowStart).Seconds())))
	}
	entry.requests++
	l.entries[client] = entry
	return 0
}

func clientIP(remoteAddress string) string {
	ip, _, err := net.SplitHostPort(remoteAddress)
	if err == nil {
		return ip
	}
	return strings.TrimSpace(remoteAddress)
}

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "strict-origin-when-cross-origin")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		next.ServeHTTP(w, r)
	})
}
