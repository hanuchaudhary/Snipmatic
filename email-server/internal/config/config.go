package config

import "os"

// Config holds all configuration for the application
type Config struct {
	Port         string
	ResendAPIKey string
	FromEmail    string
}

// Load loads configuration from environment variables
func Load() *Config {
	return &Config{
		Port:         getEnvOrDefault("PORT"),
		ResendAPIKey: getEnvOrDefault("RESEND_API_KEY"),
		FromEmail:    getEnvOrDefault("FROM_EMAIL"),
	}
}

// getEnvOrDefault returns environment variable value or default
func getEnvOrDefault(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
