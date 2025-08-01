package models

// EmailRequest represents the request structure for sending emails
type EmailRequest struct {
	Message string `json:"message"`
	TaskID  string `json:"task_id"`
}

// EmailResponse represents the response structure
type EmailResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
}
