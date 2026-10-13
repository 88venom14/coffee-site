package main

import (
	"context"
	"log"
	"net"
	"net/http"
	"time"

	"kin-coffee/backend/internal/config"
	"kin-coffee/backend/internal/database"
	"kin-coffee/backend/internal/handlers"
	"kin-coffee/backend/internal/middleware"
	"kin-coffee/backend/internal/repositories"
	"kin-coffee/backend/internal/routes"
	"kin-coffee/backend/internal/services"
)

func main() {
	if err := run(); err != nil {
		log.Fatal(err)
	}
}

func run() error {
	appConfig, err := config.Load()
	if err != nil {
		return err
	}

	ctx := context.Background()
	db, err := database.Connect(ctx, appConfig.DatabaseURL)
	if err != nil {
		return err
	}
	defer db.Close()

	postgres := repositories.NewPostgres(db)
	authService := services.NewAuth(postgres, appConfig.SessionSecret)
	apiHandlers := handlers.New(postgres, authService, appConfig.CookieSecure)
	api := routes.New(apiHandlers, middleware.RequireAuth(authService), appConfig.FrontendOrigin)

	server := &http.Server{
		Addr:              net.JoinHostPort(appConfig.Host, appConfig.Port),
		Handler:           api,
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    32 << 10,
	}

	log.Printf("Coffee API listening on %s", server.Addr)
	return server.ListenAndServe()
}
