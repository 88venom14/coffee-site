package middleware

import (
	"context"
	"net/http"

	"kin-coffee/backend/internal/httpresponse"
	"kin-coffee/backend/internal/services"
)

type authenticator interface {
	Authenticate(context.Context, string) (string, error)
}

type contextKey string

const userIDKey contextKey = "userID"

func UserID(request *http.Request) string {
	userID, _ := request.Context().Value(userIDKey).(string)
	return userID
}

func RequireAuth(auth authenticator) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie(services.SessionCookieName)
			if err != nil {
				httpresponse.Error(w, http.StatusUnauthorized, "Войдите в аккаунт, чтобы продолжить.")
				return
			}

			userID, err := auth.Authenticate(r.Context(), cookie.Value)
			if err != nil {
				httpresponse.Error(w, http.StatusUnauthorized, "Сеанс истёк. Войдите в аккаунт ещё раз.")
				return
			}

			ctx := context.WithValue(r.Context(), userIDKey, userID)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
