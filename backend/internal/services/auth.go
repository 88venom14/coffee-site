package services

import (
	"context"
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"net/mail"
	"strings"
	"unicode/utf8"

	"kin-coffee/backend/internal/models"
	"kin-coffee/backend/internal/repositories"

	"golang.org/x/crypto/bcrypt"
)

const SessionCookieName = "kin_session"

const (
	minNameLength       = 2
	maxNameLength       = 100
	minPasswordLength   = 8
	maxPasswordByteSize = 72
)

type authRepository interface {
	CreateUser(context.Context, string, string, string) (models.User, error)
	UserCredentialsByEmail(context.Context, string) (models.UserCredentials, error)
	CreateSession(context.Context, string, string) error
	UserIDBySessionHash(context.Context, string) (string, error)
	DeleteSession(context.Context, string) error
}

type Auth struct {
	repository authRepository
	secret     []byte
}

func NewAuth(repository authRepository, sessionSecret string) *Auth {
	return &Auth{repository: repository, secret: []byte(sessionSecret)}
}

func (a *Auth) Register(ctx context.Context, name, email, password string) (models.User, string, error) {
	name = strings.TrimSpace(name)
	email = strings.ToLower(strings.TrimSpace(email))
	if utf8.RuneCountInString(name) < minNameLength || utf8.RuneCountInString(name) > maxNameLength ||
		utf8.RuneCountInString(password) < minPasswordLength || len(password) > maxPasswordByteSize || !validEmail(email) {
		return models.User{}, "", ErrInvalidInput
	}

	passwordHash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return models.User{}, "", err
	}

	user, err := a.repository.CreateUser(ctx, name, email, string(passwordHash))
	if errors.Is(err, repositories.ErrEmailExists) {
		return models.User{}, "", ErrEmailTaken
	}
	if err != nil {
		return models.User{}, "", err
	}

	token, err := a.createSession(ctx, user.ID)
	return user, token, err
}

func (a *Auth) Login(ctx context.Context, email, password string) (models.User, string, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if !validEmail(email) || len(password) == 0 || len(password) > maxPasswordByteSize {
		return models.User{}, "", ErrInvalidInput
	}

	credentials, err := a.repository.UserCredentialsByEmail(ctx, email)
	if errors.Is(err, repositories.ErrNotFound) || (err == nil && bcrypt.CompareHashAndPassword([]byte(credentials.PasswordHash), []byte(password)) != nil) {
		return models.User{}, "", ErrUnauthorized
	}
	if err != nil {
		return models.User{}, "", err
	}

	token, err := a.createSession(ctx, credentials.User.ID)
	return credentials.User, token, err
}

func (a *Auth) Authenticate(ctx context.Context, token string) (string, error) {
	userID, err := a.repository.UserIDBySessionHash(ctx, a.hashToken(token))
	if err != nil {
		return "", ErrUnauthorized
	}
	return userID, nil
}

func (a *Auth) Logout(ctx context.Context, token string) error {
	return a.repository.DeleteSession(ctx, a.hashToken(token))
}

func (a *Auth) createSession(ctx context.Context, userID string) (string, error) {
	randomToken := make([]byte, 32)
	if _, err := rand.Read(randomToken); err != nil {
		return "", err
	}
	token := hex.EncodeToString(randomToken)
	if err := a.repository.CreateSession(ctx, a.hashToken(token), userID); err != nil {
		return "", err
	}
	return token, nil
}

func (a *Auth) hashToken(token string) string {
	mac := hmac.New(sha256.New, a.secret)
	_, _ = mac.Write([]byte(token))
	return hex.EncodeToString(mac.Sum(nil))
}

func validEmail(email string) bool {
	if len(email) == 0 || len(email) > 254 {
		return false
	}
	parsed, err := mail.ParseAddress(email)
	return err == nil && parsed.Address == email
}
