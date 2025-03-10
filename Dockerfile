# =====================================
# Stage 1: Build the Frontend
# =====================================
FROM node:22.14.0 AS frontend-builder
WORKDIR /app/frontend
# Copy frontend package files and install dependencies
COPY frontend/package*.json ./
RUN npm install
# Copy the rest of the frontend code and build the production version
COPY frontend/ .
RUN npm run build

# =====================================
# Stage 2: Build the Final Image
# =====================================
FROM python:3.12.6-slim-bookworm

# Install system dependencies required for the backend
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    build-essential \
    gcc \
    gfortran \
    libatlas-base-dev \
    libssl-dev \
    libffi-dev \
    libpng-dev \
    libfreetype6-dev && \
    rm -rf /var/lib/apt/lists/*

# Install Node.js (for running the frontend)
RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
    apt-get install -y nodejs && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools, and wheel
RUN pip install --upgrade pip setuptools wheel

# Set working directory to /app (this is what your backend expects)
WORKDIR /app

# -------------------------------
# Build the Backend
# -------------------------------
# Copy backend requirements first for caching
COPY backend/requirements.txt /app/
# Install backend dependencies
RUN pip install --no-cache-dir -r requirements.txt
# Copy the rest of the backend code (including processed_data)
COPY backend/ /app/

# -------------------------------
# Incorporate the Built Frontend
# -------------------------------
# Copy the entire built frontend folder into /app/frontend so that your backend remains unchanged
COPY --from=frontend-builder /app/frontend /app/frontend

# Expose the ports used by the backend and frontend
EXPOSE 5000 3000

# -------------------------------
# Install Supervisor to Run Both Services
# -------------------------------
RUN apt-get update && apt-get install -y supervisor && rm -rf /var/lib/apt/lists/*

# Copy Supervisor configuration file
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Start Supervisor (which in turn starts both the backend and frontend)
CMD ["/usr/bin/supervisord", "-n"]
