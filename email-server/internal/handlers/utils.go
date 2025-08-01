package handlers

import (
	"encoding/json"
	"net/http"
	"time"
)

// writeErrorResponse writes an error response
func writeErrorResponse(w http.ResponseWriter, message string, statusCode int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(statusCode)

	response := map[string]interface{}{
		"success":   false,
		"error":     message,
		"timestamp": time.Now().Unix(),
	}

	json.NewEncoder(w).Encode(response)
}
