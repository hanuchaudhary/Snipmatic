# Email Server

A modular Go-based email service that sends completion notifications and manages task status with automatic deactivation.

## Project Structure

```
email-server/
├── cmd/
│   └── server/
│       └── main.go          # Application entry point
├── internal/
│   ├── config/
│   │   └── config.go        # Configuration management
│   ├── handlers/
│   │   ├── email.go         # Email-related handlers
│   │   ├── health.go        # Health check handler
│   │   ├── task.go          # Task management handlers
│   │   └── utils.go         # Shared utilities
│   ├── middleware/
│   │   └── middleware.go    # HTTP middleware (CORS, logging)
│   ├── models/
│   │   ├── email.go         # Email-related models
│   │   └── task.go          # Task-related models
│   └── services/
│       ├── email.go         # Email service (Resend integration)
│       └── task.go          # Task management service
├── Dockerfile               # Docker configuration
├── Makefile                # Build automation
├── .air.toml               # Hot reload configuration
├── go.mod                  # Go module definition
└── README.md               # This file
```

## Features

- **Modular Architecture**: Clean separation of concerns with handlers, services, and models
- **Task Management**: Active task tracking with automatic deactivation
- **Email Service**: Integration with Resend for reliable email delivery
- **HTTP API**: RESTful API for email and task operations
- **Health Check**: Built-in health monitoring endpoint
- **CORS Support**: Cross-origin resource sharing enabled
- **Middleware**: Logging and request tracking
- **Hot Reload**: Development support with Air

## API Endpoints

### POST /send-completion-email

Sends a completion email when a task is completed (only if task is inactive).

**Request Body:**
```json
{
  "message": "Your task has been completed successfully",
  "task_id": "task456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### POST /active

Sets a task as active for 10 seconds (prevents email notifications during this period).

**Request Body:**
```json
{
  "task_id": "task456"
}
```

### POST /set_task

Adds a new task with email and sets it as active.

**Request Body:**
```json
{
  "task_id": "task456",
  "email": "user@example.com"
}
```

### GET /status?task_id=task456

Gets the current status of a task.

### GET /active-stats

Gets statistics about currently active tasks.

### GET /health

Health check endpoint.

## Configuration

Configure using environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `8000` |
| `RESEND_API_KEY` | Resend API key | Required |
| `FROM_EMAIL` | Sender email address | `noreply@snipmatic.com` |

## Development

### Prerequisites

- Go 1.21 or higher
- Make (optional, for using Makefile commands)

### Quick Start

1. **Clone and setup:**
   ```bash
   git clone <repository>
   cd email-server
   go mod download
   ```

2. **Set environment variables:**
   ```bash
   export RESEND_API_KEY="your-resend-api-key"
   export FROM_EMAIL="noreply@yourdomain.com"
   ```

3. **Run the application:**
   ```bash
   # Using Make
   make run
   
   # Or directly with Go
   go run ./cmd/server
   ```

### Using Makefile

```bash
# Build the application
make build

# Run the application
make run

# Run tests
make test

# Format code
make fmt

# Check for issues
make vet

# Clean build artifacts
make clean

# Install development dependencies (Air for hot reload)
make install-dev

# Run with hot reload
make dev
```

### Hot Reload Development

Install Air for automatic reloading during development:

```bash
make install-dev
make dev
```

## Docker Support

You can also run the service using Docker:

```bash
# Build the image
make docker-build

# Run the container
make docker-run

# Or manually:
docker build -t email-server .
docker run -p 8000:8000 -e RESEND_API_KEY="your-key" email-server
```

## Testing

Test the API endpoints:

```bash
# Health check
curl http://localhost:8000/health

# Set task as active
curl -X POST http://localhost:8000/active \
  -H "Content-Type: application/json" \
  -d '{"task_id": "test123"}'

# Check task status
curl "http://localhost:8000/status?task_id=test123"

# Send completion email (will be skipped if task is active)
curl -X POST http://localhost:8000/send-completion-email \
  -H "Content-Type: application/json" \
  -d '{"message": "Task completed", "task_id": "test123"}'
```

## Integration Example

```go
package main

import (
    "bytes"
    "encoding/json"
    "net/http"
)

func notifyTaskCompletion(taskID, message string) error {
    data := map[string]string{
        "task_id": taskID,
        "message": message,
    }
    
    jsonData, _ := json.Marshal(data)
    
    resp, err := http.Post(
        "http://localhost:8000/send-completion-email",
        "application/json",
        bytes.NewBuffer(jsonData),
    )
    
    return err
}
```

## Architecture

The application follows clean architecture principles:

- **cmd/**: Application entry points
- **internal/**: Private application code
  - **config/**: Configuration management
  - **handlers/**: HTTP request handlers
  - **middleware/**: HTTP middleware
  - **models/**: Data structures
  - **services/**: Business logic

This structure provides:
- Better testability
- Clear separation of concerns
- Easier maintenance and scaling
- Improved code organization

## Error Handling

The service returns appropriate HTTP status codes:

- `200`: Success
- `400`: Bad request (missing fields, invalid data)
- `405`: Method not allowed
- `500`: Internal server error

All error responses include a JSON body with error details.
