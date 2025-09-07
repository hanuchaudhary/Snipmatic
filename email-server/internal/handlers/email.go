package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"email-server/internal/models"
	"email-server/internal/services"
)

// EmailHandler handles email-related requests
type EmailHandler struct {
	emailService *services.EmailService
	taskService  *services.TaskService
}

// NewEmailHandler creates a new email handler
func NewEmailHandler(emailService *services.EmailService, taskService *services.TaskService) *EmailHandler {
	return &EmailHandler{
		emailService: emailService,
		taskService:  taskService,
	}
}

// SendEmail handles the HTTP request to send completion emails
func (h *EmailHandler) SendEmail(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.EmailRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request: %v", err)
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	// Validate required fields
	if req.TaskID == "" {
		writeErrorResponse(w, "Missing required field: task_id", http.StatusBadRequest)
		return
	}

	// Check if task is currently active - only send emails for inactive tasks
	isActive, _ := h.taskService.GetTaskStatus(req.TaskID)
	if isActive {
		log.Printf("Task %s is currently active, skipping email notification", req.TaskID)
		response := models.EmailResponse{
			Success: true,
			Message: "Email skipped - task is currently active",
		}
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(response)
		return
	}

	log.Printf("Task %s is inactive, sending email notification", req.TaskID)

	// Send email using the email service
	if err := h.emailService.SendCompletionEmail(req); err != nil {
		log.Printf("Error sending email: %v", err)
		writeErrorResponse(w, "Failed to send email", http.StatusInternalServerError)
		return
	}

	// Clean up the task after sending email
	if err := h.taskService.CleanupCompletedTask(req.TaskID); err != nil {
		log.Printf("Warning: Failed to clean up task %s: %v", req.TaskID, err)
		// Continue anyway - not critical
	}

	// Return success response
	response := models.EmailResponse{
		Success: true,
		Message: "Email sent successfully",
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
