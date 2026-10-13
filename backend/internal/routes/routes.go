package routes

import (
	"net/http"
	"time"

	"kin-coffee/backend/internal/handlers"
	"kin-coffee/backend/internal/middleware"
)

func New(api *handlers.Handler, requireAuth func(http.Handler) http.Handler, frontendOrigin string) http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /api/health", func(w http.ResponseWriter, r *http.Request) {
		handlers.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})

	registerPublicRoutes(mux, api, middleware.IPRateLimit(10, time.Minute))
	registerProtectedRoutes(mux, api, requireAuth)

	return middleware.SecurityHeaders(cors(frontendOrigin, mux))
}

func registerPublicRoutes(mux *http.ServeMux, api *handlers.Handler, limitAuth func(http.Handler) http.Handler) {
	mux.HandleFunc("GET /api/products", api.ListProducts)
	mux.HandleFunc("GET /api/products/{id}", api.GetProduct)
	mux.Handle("POST /api/auth/register", limitAuth(http.HandlerFunc(api.Register)))
	mux.Handle("POST /api/auth/login", limitAuth(http.HandlerFunc(api.Login)))
	mux.HandleFunc("POST /api/auth/logout", api.Logout)
}

func registerProtectedRoutes(mux *http.ServeMux, api *handlers.Handler, requireAuth func(http.Handler) http.Handler) {
	mux.Handle("GET /api/auth/me", requireAuth(http.HandlerFunc(api.Me)))
	mux.Handle("GET /api/cart", requireAuth(http.HandlerFunc(api.GetCart)))
	mux.Handle("POST /api/cart/items", requireAuth(http.HandlerFunc(api.AddCartItem)))
	mux.Handle("PATCH /api/cart/items/{id}", requireAuth(http.HandlerFunc(api.UpdateCartItem)))
	mux.Handle("DELETE /api/cart/items/{id}", requireAuth(http.HandlerFunc(api.DeleteCartItem)))
	mux.Handle("DELETE /api/cart", requireAuth(http.HandlerFunc(api.ClearCart)))
	mux.Handle("POST /api/orders", requireAuth(http.HandlerFunc(api.CreateOrder)))
	mux.Handle("GET /api/orders", requireAuth(http.HandlerFunc(api.ListOrders)))
	mux.Handle("GET /api/orders/{id}", requireAuth(http.HandlerFunc(api.GetOrder)))
}
