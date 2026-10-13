package handlers

import (
	"errors"
	"net/http"
	"time"

	"kin-coffee/backend/internal/middleware"
	"kin-coffee/backend/internal/repositories"
	"kin-coffee/backend/internal/services"
)

func (h *Handler) Register(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		WriteError(w, http.StatusBadRequest, "Укажите имя, электронную почту и пароль.")
		return
	}

	user, token, err := h.auth.Register(r.Context(), input.Name, input.Email, input.Password)
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		WriteError(w, http.StatusBadRequest, "Укажите имя от 2 до 100 символов, корректную почту и пароль от 8 до 72 байт.")
		return
	case errors.Is(err, services.ErrEmailTaken):
		WriteError(w, http.StatusConflict, "Аккаунт с такой электронной почтой уже существует.")
		return
	case err != nil:
		writeInternalError(w, "Не удалось создать аккаунт.")
		return
	}

	h.setSessionCookie(w, token)
	WriteJSON(w, http.StatusCreated, user)
}

func (h *Handler) Login(w http.ResponseWriter, r *http.Request) {
	var input struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := decodeJSON(w, r, &input); err != nil {
		WriteError(w, http.StatusBadRequest, "Укажите электронную почту и пароль.")
		return
	}

	user, token, err := h.auth.Login(r.Context(), input.Email, input.Password)
	switch {
	case errors.Is(err, services.ErrInvalidInput):
		WriteError(w, http.StatusBadRequest, "Укажите корректную электронную почту и пароль не длиннее 72 байт.")
		return
	case errors.Is(err, services.ErrUnauthorized):
		WriteError(w, http.StatusUnauthorized, "Неверная электронная почта или пароль.")
		return
	case err != nil:
		writeInternalError(w, "Не удалось войти в аккаунт.")
		return
	}

	h.setSessionCookie(w, token)
	WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) Logout(w http.ResponseWriter, r *http.Request) {
	if cookie, err := r.Cookie(services.SessionCookieName); err == nil {
		if err := h.auth.Logout(r.Context(), cookie.Value); err != nil {
			writeInternalError(w, "Не удалось завершить сеанс.")
			return
		}
	}

	h.clearSessionCookie(w)
	WriteJSON(w, http.StatusOK, map[string]bool{"ok": true})
}

func (h *Handler) Me(w http.ResponseWriter, r *http.Request) {
	user, err := h.repository.UserByID(r.Context(), middleware.UserID(r))
	if errors.Is(err, repositories.ErrNotFound) {
		WriteError(w, http.StatusUnauthorized, "Войдите в аккаунт.")
		return
	}
	if err != nil {
		writeInternalError(w, "Не удалось загрузить аккаунт.")
		return
	}
	WriteJSON(w, http.StatusOK, user)
}

func (h *Handler) setSessionCookie(w http.ResponseWriter, token string) {
	http.SetCookie(w, &http.Cookie{
		Name:     services.SessionCookieName,
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cookieSecure,
		SameSite: http.SameSiteLaxMode,
		Expires:  time.Now().Add(30 * 24 * time.Hour),
		MaxAge:   30 * 24 * 60 * 60,
	})
}

func (h *Handler) clearSessionCookie(w http.ResponseWriter) {
	http.SetCookie(w, &http.Cookie{
		Name:     services.SessionCookieName,
		Value:    "",
		Path:     "/",
		HttpOnly: true,
		Secure:   h.cookieSecure,
		SameSite: http.SameSiteLaxMode,
		MaxAge:   -1,
	})
}
