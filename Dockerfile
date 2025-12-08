# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Expose port
EXPOSE 3000

# Run Vite dev server
CMD ["npm", "run", "dev"]

# Build stage for production
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
# Railway automatically injects VITE_* environment variables during build
# These are available to Vite at build time
RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally for serving static files
RUN npm install -g serve

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Expose port (Railway will inject PORT variable)
EXPOSE 3000

# Serve the built files
# Railway injects PORT variable, so we use it
CMD ["sh", "-c", "serve -s dist -l ${PORT:-3000}"]
