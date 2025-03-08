# Stage 1: Build the application
FROM node:22.14.0 AS builder

WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the application code and build the production version
COPY . .
RUN npm run build

# Stage 2: Run the application in production
FROM node:22.14.0

WORKDIR /app

# Set environment variable for production
ENV NODE_ENV production

# Copy only the necessary files from the build stage
COPY --from=builder /app/ ./

# Expose port 3000 for the Next.js app
EXPOSE 3000

# Start the app in production mode
CMD ["npm", "start"]
