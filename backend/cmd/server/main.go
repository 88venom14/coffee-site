package main

import (
	"context"
	"log"
	"net/http"

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
		Addr:    ":" + appConfig.Port,
		Handler: api,
	}

	log.Printf("Coffee API listening on :%s", appConfig.Port)
	return server.ListenAndServe()
}
