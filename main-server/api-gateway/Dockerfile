FROM python:3.10-slim

WORKDIR /app

# Copy shared modules
COPY shared/ ./shared/

# Copy service code
COPY api-gateway/ ./

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Create storage directories
RUN mkdir -p /app/storage/videos /app/storage/audio /app/storage/clips

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
