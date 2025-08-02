package config

import (
	"os"
	"github.com/joho/godotenv"
)

// Config holds all configuration for the application
type Config struct {
	Port         string
	ResendAPIKey string
	FromEmail    string
}

// Load loads configuration from environment variables
func Load() *Config {
	_=godotenv.Load() 
	println("Loading configuration from environment variables...")
	
	return &Config{
		Port:         os.Getenv("PORT"),
		ResendAPIKey: os.Getenv("RESEND_API_KEY"),
		FromEmail:    os.Getenv("FROM_EMAIL"),
	}
}