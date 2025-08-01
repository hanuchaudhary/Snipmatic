package services

import (
	"log"
	"sync"
	"time"

	"email-server/internal/models"
)

// TaskService handles task status operations
type TaskService struct {
	activeTasks map[string]*models.TaskStatus
	mutex       sync.RWMutex
}

// NewTaskService creates a new task service instance
func NewTaskService() *TaskService {
	return &TaskService{
		activeTasks: make(map[string]*models.TaskStatus),
	}
}

// SetTaskActive sets a task as active and schedules auto-deactivation
func (s *TaskService) SetTaskActive(taskID string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	now := time.Now()
	deactivateAt := now.Add(10 * time.Second)

	// Update or create task status
	if taskStatus, exists := s.activeTasks[taskID]; exists {
		taskStatus.IsActive = true
		taskStatus.ActivatedAt = now
		taskStatus.DeactivateAt = deactivateAt
	}

	log.Printf("Task %s set to active for email, will be deactivated at %s", taskID, deactivateAt.Format(time.RFC3339))

	// Schedule auto-deactivation
	go func() {
		time.Sleep(10 * time.Second)
		s.deactivateTask(taskID, deactivateAt)
	}()
}

// AddTask adds a new task with email and sets it as active
func (s *TaskService) AddTask(taskID, email string) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	now := time.Now()
	deactivateAt := now.Add(10 * time.Second)

	// Update or create task status
	s.activeTasks[taskID] = &models.TaskStatus{
		TaskID:       taskID,
		Email:        email,
		IsActive:     true,
		ActivatedAt:  now,
		DeactivateAt: deactivateAt,
	}

	log.Printf("Task %s added and set to active, will be deactivated at %s", taskID, deactivateAt.Format(time.RFC3339))

	// Schedule auto-deactivation
	go func() {
		time.Sleep(10 * time.Second)
		s.deactivateTask(taskID, deactivateAt)
	}()
}

// deactivateTask deactivates a task if the deactivation time matches
func (s *TaskService) deactivateTask(taskID string, scheduledDeactivateAt time.Time) {
	s.mutex.Lock()
	defer s.mutex.Unlock()

	if taskStatus, exists := s.activeTasks[taskID]; exists {
		// Only deactivate if this is the same activation session
		if taskStatus.DeactivateAt.Equal(scheduledDeactivateAt) {
			taskStatus.IsActive = false
			log.Printf("Task %s automatically deactivated", taskID)
		}
	}
}

// GetTaskStatus returns the current status of a task
func (s *TaskService) GetTaskStatus(taskID string) (bool, *models.TaskStatus) {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	if taskStatus, exists := s.activeTasks[taskID]; exists {
		return taskStatus.IsActive, taskStatus
	}
	return false, nil
}

// GetAllActiveTasks returns a list of all currently active tasks
func (s *TaskService) GetAllActiveTasks() []string {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	var activeTaskIDs []string
	for taskID, taskStatus := range s.activeTasks {
		if taskStatus.IsActive {
			activeTaskIDs = append(activeTaskIDs, taskID)
		}
	}
	return activeTaskIDs
}

// GetActiveTaskCount returns the count of currently active tasks
func (s *TaskService) GetActiveTaskCount() int {
	s.mutex.RLock()
	defer s.mutex.RUnlock()

	count := 0
	for _, taskStatus := range s.activeTasks {
		if taskStatus.IsActive {
			count++
		}
	}
	return count
}
