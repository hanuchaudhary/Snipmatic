package handlers

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"email-server/internal/models"
	"email-server/internal/services"
)

// TaskHandler handles task-related requests
type TaskHandler struct {
	taskService *services.TaskService
}

// NewTaskHandler creates a new task handler
func NewTaskHandler(taskService *services.TaskService) *TaskHandler {
	return &TaskHandler{
		taskService: taskService,
	}
}

// SetActive handles setting tasks as active with auto-deactivation
func (h *TaskHandler) SetActive(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.TaskActiveRequest
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

	// Set task as active
	h.taskService.SetTaskActive(req.TaskID)

	// Return success response
	response := models.TaskActiveResponse{
		Success:   true,
		Message:   "Task set to active",
		TaskID:    req.TaskID,
		IsActive:  true,
		Timestamp: time.Now().Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// AddTask handles adding new tasks
func (h *TaskHandler) AddTask(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var req models.TaskAddRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		log.Printf("Error decoding request: %v", err)
		writeErrorResponse(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.TaskID == "" || req.Email == "" {
		writeErrorResponse(w, "Missing required field: task_id or email", http.StatusBadRequest)
		return
	}

	// Add task
	h.taskService.AddTask(req.TaskID, req.Email)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "Task added successfully"})
}

// GetStatus handles GET requests to check task status
func (h *TaskHandler) GetStatus(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	taskID := r.URL.Query().Get("task_id")
	if taskID == "" {
		writeErrorResponse(w, "Missing required parameter: task_id", http.StatusBadRequest)
		return
	}

	isActive, taskStatus := h.taskService.GetTaskStatus(taskID)

	var response models.TaskActiveResponse
	if taskStatus != nil {
		response = models.TaskActiveResponse{
			Success:   true,
			Message:   "Task status retrieved",
			TaskID:    taskID,
			IsActive:  isActive,
			Timestamp: taskStatus.ActivatedAt.Unix(),
		}
	} else {
		response = models.TaskActiveResponse{
			Success:   true,
			Message:   "Task not found or never activated",
			TaskID:    taskID,
			IsActive:  false,
			Timestamp: time.Now().Unix(),
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

// GetActiveStats handles GET requests to get active tasks statistics
func (h *TaskHandler) GetActiveStats(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	activeTasksList := h.taskService.GetAllActiveTasks()
	activeCount := h.taskService.GetActiveTaskCount()

	response := map[string]interface{}{
		"success":      true,
		"active_count": activeCount,
		"active_tasks": activeTasksList,
		"timestamp":    time.Now().Unix(),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
