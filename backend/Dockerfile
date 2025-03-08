# Use Python 3.12 as base image (Bookworm for latest Debian support)
FROM python:3.12.6-slim-bookworm

# Install system dependencies required for pandas, numpy, and scikit-learn
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    gcc \
    gfortran \
    libatlas-base-dev \
    libssl-dev \
    libffi-dev \
    libpng-dev \
    libfreetype6-dev \
    && rm -rf /var/lib/apt/lists/*

# Upgrade pip, setuptools, and wheel to avoid dependency issues
RUN pip install --upgrade pip setuptools wheel

# Set the working directory in the container
WORKDIR /app

# Copy the requirements file first (leveraging Docker caching)
COPY requirements.txt .

# Install dependencies from requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the processed_data folder (ENSURING CSV FILES ARE INCLUDED)
COPY processed_data /app/processed_data

# Copy the rest of the backend code
COPY . /app

# Expose Flask's default port
EXPOSE 5000

# Run the FASTAPI app
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "5000"]
