package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"

	"kin-coffee/backend/internal/httpresponse"
	"kin-coffee/backend/internal/middleware"
	"kin-coffee/backend/internal/repositories"
	"kin-coffee/backend/internal/services"
)

type Handler struct {
	repository   *repositories.Postgres
	auth         *services.Auth
	cookieSecure bool
}

func New(repository *repositories.Postgres, auth *services.Auth, cookieSecure bool) *Handler {
	return &Handler{repository: repository, auth: auth, cookieSecure: cookieSecure}
}

func WriteJSON(w http.ResponseWriter, status int, data any) {
	httpresponse.JSON(w, status, data)
}

func WriteError(w http.ResponseWriter, status int, message string) {
	httpresponse.Error(w, status, message)
}

func decodeJSON(w http.ResponseWriter, r *http.Request, target any) error {
	r.Body = http.MaxBytesReader(w, r.Body, 1<<20)
	decoder := json.NewDecoder(r.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(target); err != nil {
		return err
	}

	var extra any
	if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
		return errors.New("request must contain exactly one JSON object")
	}
	return nil
}

func writeInternalError(w http.ResponseWriter, message string) {
	WriteError(w, http.StatusInternalServerError, message)
}

func currentUserID(r *http.Request) string {
	return middleware.UserID(r)
}
