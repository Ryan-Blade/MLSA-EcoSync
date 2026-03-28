# Build the standalone Python Backend for EcoSync
FROM python:3.11-slim
WORKDIR /server

# Install Python dependencies
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy the backend code
COPY backend/ ./backend/

# Setup host and port dynamically relying on PORT environment variable, defaults to 8000
WORKDIR /server/backend
CMD ["python", "main.py", "--buildings", "50"]
