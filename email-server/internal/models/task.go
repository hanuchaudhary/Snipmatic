package models

import "time"

// TaskActiveRequest represents the request structure for setting task active status
type TaskActiveRequest struct {
	TaskID string `json:"task_id"`
}

// TaskAddRequest represents the request structure for adding a task
type TaskAddRequest struct {
	TaskID string `json:"task_id"`
	Email  string `json:"email"`
}

// TaskActiveResponse represents the response structure for task active status
type TaskActiveResponse struct {
	Success   bool   `json:"success"`
	Message   string `json:"message"`
	TaskID    string `json:"task_id"`
	IsActive  bool   `json:"is_active"`
	Timestamp int64  `json:"timestamp"`
}

// TaskStatus represents the internal task status tracking
type TaskStatus struct {
	TaskID       string
	Email        string
	IsActive     bool
	ActivatedAt  time.Time
	DeactivateAt time.Time
}
