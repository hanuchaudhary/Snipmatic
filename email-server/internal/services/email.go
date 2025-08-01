package services

import (
	"fmt"
	"log"

	"email-server/internal/config"
	"email-server/internal/models"

	"github.com/resend/resend-go/v2"
)

// EmailService handles email operations
type EmailService struct {
	client      *resend.Client
	config      *config.Config
	taskService *TaskService
}

// NewEmailService creates a new email service instance
func NewEmailService(cfg *config.Config, taskService *TaskService) (*EmailService, error) {
	if cfg.ResendAPIKey == "" {
		return nil, fmt.Errorf("RESEND_API_KEY is required")
	}

	// Validate API key format (Resend keys start with "re_")
	if len(cfg.ResendAPIKey) < 3 || cfg.ResendAPIKey[:3] != "re_" {
		return nil, fmt.Errorf("invalid Resend API key format")
	}

	client := resend.NewClient(cfg.ResendAPIKey)
	if client == nil {
		return nil, fmt.Errorf("failed to create Resend client")
	}

	log.Printf("Resend client initialized successfully")

	return &EmailService{
		client:      client,
		config:      cfg,
		taskService: taskService,
	}, nil
}

// SendCompletionEmail sends a completion email using Resend
func (s *EmailService) SendCompletionEmail(req models.EmailRequest) error {
	// Get the task details to fetch the email address
	_, taskStatus := s.taskService.GetTaskStatus(req.TaskID)
	if taskStatus == nil {
		return fmt.Errorf("task not found: %s", req.TaskID)
	}
	fmt.Println(taskStatus.Email)
	if taskStatus.Email == "" {
		return fmt.Errorf("no email address found for task: %s", req.TaskID)
	}

	params := &resend.SendEmailRequest{
		From:    s.config.FromEmail,
		To:      []string{taskStatus.Email},
		Subject: "Task Completion Notification",
		Html:    fmt.Sprintf("<h1>Task Completed</h1><p>Your task has been completed.</p><p>Message: %s</p>", req.Message),
		Text:    fmt.Sprintf("Task has been completed. Message: %s", req.Message),
	}

	sent, err := s.client.Emails.Send(params)
	if err != nil {
		return fmt.Errorf("failed to send email: %w", err)
	}

	log.Printf("Email sent successfully to %s. ID: %s", taskStatus.Email, sent.Id)
	return nil
}
