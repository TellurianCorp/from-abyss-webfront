# Production Dockerfile for webfront
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
# ARG allows build-time variables to be passed
# Railway will inject VITE_* variables during build
ARG VITE_API_URL
ARG VITE_API_BASE_URL
ARG VITE_ACTIVITYPUB_DOMAIN
ARG VITE_LIFEAUTH_URL
ARG VITE_LIFEAUTH_CLIENT_ID
ARG VITE_WS_URL

# Set build-time environment variables
ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}
ENV VITE_ACTIVITYPUB_DOMAIN=${VITE_ACTIVITYPUB_DOMAIN}
ENV VITE_LIFEAUTH_URL=${VITE_LIFEAUTH_URL}
ENV VITE_LIFEAUTH_CLIENT_ID=${VITE_LIFEAUTH_CLIENT_ID}
ENV VITE_WS_URL=${VITE_WS_URL}

RUN npm run build

# Production stage
FROM node:20-alpine

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
