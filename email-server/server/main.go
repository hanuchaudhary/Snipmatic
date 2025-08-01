package main

import (
	"log"
	"net/http"

	"email-server/internal/config"
	"email-server/internal/handlers"
	"email-server/internal/middleware"
	"email-server/internal/services"

	"github.com/gorilla/mux"
)

func main() {
	// Load configuration
	cfg := config.Load()

	// Initialize services
	taskService := services.NewTaskService()
	
	emailService, err := services.NewEmailService(cfg, taskService)
	if err != nil {
		log.Fatalf("Failed to initialize email service: %v", err)
	}

	// Initialize handlers
	emailHandler := handlers.NewEmailHandler(emailService, taskService)
	taskHandler := handlers.NewTaskHandler(taskService)

	// Create router
	r := mux.NewRouter()

	// Apply middleware
	r.Use(middleware.CORSMiddleware)
	r.Use(middleware.LoggingMiddleware)

	// Routes
	r.HandleFunc("/health", handlers.HealthHandler).Methods("GET")
	r.HandleFunc("/send-completion-email", emailHandler.SendEmail).Methods("POST")
	r.HandleFunc("/active", taskHandler.SetActive).Methods("POST")
	r.HandleFunc("/status", taskHandler.GetStatus).Methods("GET")
	r.HandleFunc("/active-stats", taskHandler.GetActiveStats).Methods("GET")
	r.HandleFunc("/set_task", taskHandler.AddTask).Methods("POST")

	log.Printf("Email server starting on port %s", cfg.Port)
	log.Printf("From Email: %s", cfg.FromEmail)
	log.Printf("Resend API Key configured: %s", cfg.ResendAPIKey)

	// Start server
	if err := http.ListenAndServe(":"+cfg.Port, r); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
