# Makefile for email-server
.PHONY: build run test clean docker-build docker-run

APP_NAME=email-server
MAIN_PATH=./cmd/server
DOCKER_IMAGE=email-server:latest

# Build the application
build:
	go build -buildvcs=false -o bin/$(APP_NAME) $(MAIN_PATH)

# Run the application
run:
	go run $(MAIN_PATH)

# Test the application
test:
	go test ./...

# Clean build artifacts
clean:
	rm -rf bin/

# Format code
fmt:
	go fmt ./...

# Check for issues
vet:
	go vet ./...

# Download dependencies
deps:
	go mod download
	go mod tidy

# Build Docker image
docker-build:
	docker build -t $(DOCKER_IMAGE) .

# Run Docker container
docker-run:
	docker run -p 8000:8000 $(DOCKER_IMAGE)

# Development - run with hot reload (requires air: go install github.com/cosmtrek/air@latest)
dev:
	air

# Install development dependencies
install-dev:
	go install github.com/cosmtrek/air@latest
