# Use Node.js 22 as base image
FROM node:22.14.0

# Set the working directory in the container
WORKDIR /app

# Copy package.json and lock file before copying the rest (to leverage caching)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the frontend code
COPY . /app

# Expose port 3000 for Next.js frontend
EXPOSE 3000

# Run the Next.js development server
CMD ["npm", "run", "dev"]
