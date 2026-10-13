package services

import (
	"context"
	"errors"
	"testing"

	"kin-coffee/backend/internal/models"
	"kin-coffee/backend/internal/repositories"

	"golang.org/x/crypto/bcrypt"
)

type memoryAuthRepository struct {
	usersByEmail map[string]models.UserCredentials
	sessions     map[string]string
	userCount    int
}

func newMemoryAuthRepository() *memoryAuthRepository {
	return &memoryAuthRepository{
		usersByEmail: make(map[string]models.UserCredentials),
		sessions:     make(map[string]string),
	}
}

func (r *memoryAuthRepository) CreateUser(_ context.Context, name, email, passwordHash string) (models.User, error) {
	if _, exists := r.usersByEmail[email]; exists {
		return models.User{}, repositories.ErrEmailExists
	}
	r.userCount++
	user := models.User{ID: "user-1", Name: name, Email: email}
	r.usersByEmail[email] = models.UserCredentials{User: user, PasswordHash: passwordHash}
	return user, nil
}

func (r *memoryAuthRepository) UserCredentialsByEmail(_ context.Context, email string) (models.UserCredentials, error) {
	credentials, exists := r.usersByEmail[email]
	if !exists {
		return models.UserCredentials{}, repositories.ErrNotFound
	}
	return credentials, nil
}

func (r *memoryAuthRepository) CreateSession(_ context.Context, tokenHash, userID string) error {
	r.sessions[tokenHash] = userID
	return nil
}

func (r *memoryAuthRepository) UserIDBySessionHash(_ context.Context, tokenHash string) (string, error) {
	userID, exists := r.sessions[tokenHash]
	if !exists {
		return "", repositories.ErrNotFound
	}
	return userID, nil
}

func (r *memoryAuthRepository) DeleteSession(_ context.Context, tokenHash string) error {
	delete(r.sessions, tokenHash)
	return nil
}

func TestRegisterCreatesUserAndSession(t *testing.T) {
	repository := newMemoryAuthRepository()
	auth := NewAuth(repository, "a-long-test-session-secret-value-123456")

	user, token, err := auth.Register(context.Background(), " Casey Example ", "CASEY@example.com", "coffee-password")
	if err != nil {
		t.Fatalf("Register() returned an unexpected error: %v", err)
	}
	if user.Name != "Casey Example" || user.Email != "casey@example.com" {
		t.Fatalf("Register() user = %#v, want normalized details", user)
	}
	if token == "" {
		t.Fatal("Register() returned an empty session token")
	}

	userID, err := auth.Authenticate(context.Background(), token)
	if err != nil {
		t.Fatalf("Authenticate() returned an unexpected error: %v", err)
	}
	if userID != user.ID {
		t.Fatalf("Authenticate() userID = %q, want %q", userID, user.ID)
	}
}

func TestRegisterRejectsInvalidInput(t *testing.T) {
	auth := NewAuth(newMemoryAuthRepository(), "a-long-test-session-secret-value-123456")
	_, _, err := auth.Register(context.Background(), "A", "not-an-email", "short")
	if !errors.Is(err, ErrInvalidInput) {
		t.Fatalf("Register() error = %v, want %v", err, ErrInvalidInput)
	}
}

func TestLoginRejectsWrongPassword(t *testing.T) {
	repository := newMemoryAuthRepository()
	passwordHash, err := bcrypt.GenerateFromPassword([]byte("right-password"), bcrypt.MinCost)
	if err != nil {
		t.Fatalf("GenerateFromPassword() returned an unexpected error: %v", err)
	}
	repository.usersByEmail["casey@example.com"] = models.UserCredentials{
		User:         models.User{ID: "user-1", Name: "Casey Example", Email: "casey@example.com"},
		PasswordHash: string(passwordHash),
	}
	auth := NewAuth(repository, "a-long-test-session-secret-value-123456")

	_, _, err = auth.Login(context.Background(), "casey@example.com", "wrong-password")
	if !errors.Is(err, ErrUnauthorized) {
		t.Fatalf("Login() error = %v, want %v", err, ErrUnauthorized)
	}
}

func TestLogoutInvalidatesSession(t *testing.T) {
	repository := newMemoryAuthRepository()
	auth := NewAuth(repository, "a-long-test-session-secret-value-123456")
	_, token, err := auth.Register(context.Background(), "Casey Example", "casey@example.com", "coffee-password")
	if err != nil {
		t.Fatalf("Register() returned an unexpected error: %v", err)
	}
	if err := auth.Logout(context.Background(), token); err != nil {
		t.Fatalf("Logout() returned an unexpected error: %v", err)
	}
	if _, err := auth.Authenticate(context.Background(), token); !errors.Is(err, ErrUnauthorized) {
		t.Fatalf("Authenticate() after Logout() error = %v, want %v", err, ErrUnauthorized)
	}
}
