# Dockerfile para Railway com Nginx
# Este Dockerfile usa nginx para servir arquivos estáticos E fazer proxy para ActivityPub
# 
# Como usar:
# 1. Renomeie este arquivo para Dockerfile (ou configure Railway para usar Dockerfile.railway)
# 2. Configure a variável de ambiente RAILWAY_API_URL no Railway apontando para api.fromabyss.com
# 3. Deploy no Railway

# Build stage
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
RUN npm run build

# Production stage with Nginx
FROM nginx:alpine

# Copy built files from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-railway.conf /etc/nginx/conf.d/default.conf

# Copy entrypoint script
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Expose port (Railway will inject PORT variable, but nginx uses 80 internally)
EXPOSE 80

# Start nginx with entrypoint script (permite usar RAILWAY_API_URL)
CMD ["/entrypoint.sh"]
