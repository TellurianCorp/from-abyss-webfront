# Development Dockerfile for webfront
# This is optimized for development with volume mounts
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Expose port 3000 (matching docker-compose.yml and vite.config.ts)
EXPOSE 3000

# Start Vite dev server
# Note: Source code is mounted as a volume in docker-compose.yml
CMD ["npm", "run", "dev"]
