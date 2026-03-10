# Development Dockerfile for Python ETL/Data Engineering service
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies for psycopg2 and other packages
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Create non-root user
RUN useradd -m -u 1000 appuser

# Copy and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Set ownership
RUN chown -R appuser:appuser /app

USER appuser

ENV PYTHONUNBUFFERED=1

CMD ["python", "etl_pipeline.py"]
