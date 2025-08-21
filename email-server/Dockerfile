# Build stage
FROM golang:1.23-alpine AS builder

WORKDIR /app

# Copy go mod and sum files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main ./server

# Final stage
FROM alpine:latest

# Install CA certs
RUN apk --no-cache add ca-certificates

# Create a non-root user for running the app
RUN addgroup -S appgroup && adduser -S app -G appgroup

WORKDIR /app

# Copy the built binary from the builder stage
COPY --from=builder /app/main .

# Ensure the binary is owned by the non-root user
RUN chown app:appgroup /app/main

# Default port (can be overridden by Render via the PORT env var)
ENV PORT=8080

# Switch to non-root user
USER app

# Expose port (informational)
EXPOSE 8080

# Command to run
CMD ["./main"]
