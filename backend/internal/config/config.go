package config

import (
	"fmt"
	"os"
	"strings"

	"github.com/joho/godotenv"
)

type Config struct {
	DatabaseURL    string
	Port           string
	SessionSecret  string
	CookieSecure   bool
	FrontendOrigin string
}

func Load() (Config, error) {
	_ = godotenv.Load(".env", "../.env", "../../.env")

	cfg := Config{
		DatabaseURL:    strings.TrimSpace(os.Getenv("DATABASE_URL")),
		Port:           strings.TrimSpace(os.Getenv("PORT")),
		SessionSecret:  os.Getenv("SESSION_SECRET"),
		CookieSecure:   strings.EqualFold(os.Getenv("COOKIE_SECURE"), "true"),
		FrontendOrigin: strings.TrimRight(strings.TrimSpace(os.Getenv("FRONTEND_ORIGIN")), "/"),
	}

	if cfg.DatabaseURL == "" {
		return Config{}, fmt.Errorf("DATABASE_URL is required")
	}
	if len(cfg.SessionSecret) < 32 {
		return Config{}, fmt.Errorf("SESSION_SECRET must contain at least 32 characters")
	}
	if cfg.Port == "" {
		cfg.Port = "8080"
	}

	return cfg, nil
}
