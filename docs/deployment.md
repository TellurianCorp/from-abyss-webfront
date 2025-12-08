# Deployment Guide

## Overview

This guide covers various deployment options for the From Abyss Dashboard, including Railway, Docker, and manual deployment.

## Railway Deployment (Recommended)

Railway is the recommended deployment platform for this project. The project includes all necessary configuration files for Railway deployment.

### Prerequisites

1. **Railway Account**: Sign up at [railway.app](https://railway.app)
2. **GitHub Repository**: Ensure your code is in a GitHub repository
3. **Railway CLI** (optional): Install for local development

### Automatic Deployment

1. **Connect Repository**:
   - Go to Railway dashboard
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your repository

2. **Configure Environment Variables**:
   ```bash
   # Required variables
   SECRET_KEY=your-secret-key
   DEBUG=False
   ALLOWED_HOSTS=your-domain.railway.app
   
   # Database (Railway PostgreSQL)
   DATABASE_URL=postgresql://...
   
   # Redis (Railway Redis)
   REDIS_URL=redis://...
   
   # Cloudflare R2 (for file storage)
   R2_ACCESS_KEY_ID=your-access-key
   R2_SECRET_ACCESS_KEY=your-secret-key
   R2_BUCKET_NAME=your-bucket-name
   R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com
   
   # Social Media APIs
   TWITTER_API_KEY=your-twitter-api-key
   TWITTER_API_SECRET=your-twitter-api-secret
   TWITTER_ACCESS_TOKEN=your-access-token
   TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret
   
   # Spotify API
   SPOTIFY_CLIENT_ID=your-spotify-client-id
   SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
   
   # Steam API
   STEAM_API_KEY=your-steam-api-key
   ```

3. **Deploy**:
   - Railway will automatically detect the project type
   - Build and deployment will start automatically
   - Monitor the deployment logs

4. **Run Migrations**:
   ```bash
   # Via Railway CLI
   railway run python manage.py migrate
   
   # Or via Railway dashboard
   # Go to your project → Deployments → Latest deployment → View logs
   ```

5. **Create Superuser**:
   ```bash
   railway run python manage.py createsuperuser
   ```

### Railway Configuration Files

The project includes these Railway-specific files:

- **`config/railway.toml`**: Railway project configuration
- **`config/nixpacks.toml`**: Build configuration for Railway
- **`config/Procfile`**: Process definitions
- **`config/Dockerfile`**: Alternative container configuration

### Custom Domain

1. **Add Custom Domain**:
   - Go to Railway dashboard → Settings → Domains
   - Add your custom domain
   - Update DNS records as instructed

2. **Update Environment Variables**:
   ```bash
   ALLOWED_HOSTS=your-domain.com,www.your-domain.com
   ```

## Docker Deployment

### Prerequisites

- Docker and Docker Compose installed
- Docker Hub account (optional)

### Dockerfile

The project includes a `config/Dockerfile` for containerized deployment:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project files
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "fromabyssdashboard.wsgi:application"]
```

### Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  web:
    build: .
    ports:
      - "8000:8000"
    environment:
      - SECRET_KEY=your-secret-key
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:password@db:5432/fromabyss
      - REDIS_URL=redis://redis:6379/0
    depends_on:
      - db
      - redis
    volumes:
      - static_volume:/app/staticfiles
      - media_volume:/app/media

  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=fromabyss
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    volumes:
      - redis_data:/data

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - static_volume:/app/staticfiles
      - media_volume:/app/media
    depends_on:
      - web

volumes:
  postgres_data:
  redis_data:
  static_volume:
  media_volume:
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream django {
        server web:8000;
    }

    server {
        listen 80;
        server_name your-domain.com;

        location /static/ {
            alias /app/staticfiles/;
        }

        location /media/ {
            alias /app/media/;
        }

        location / {
            proxy_pass http://django;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

### Deployment Commands

```bash
# Build and start services
docker-compose up -d

# Run migrations
docker-compose exec web python manage.py migrate

# Create superuser
docker-compose exec web python manage.py createsuperuser

# Collect static files
docker-compose exec web python manage.py collectstatic --noinput

# View logs
docker-compose logs -f web
```

## Manual Deployment

### Prerequisites

- Ubuntu 20.04+ or similar Linux distribution
- Python 3.8+
- PostgreSQL 12+
- Redis 6+
- Nginx
- FFmpeg

### Server Setup

1. **Update System**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

2. **Install Dependencies**:
   ```bash
   sudo apt install -y python3 python3-pip python3-venv postgresql postgresql-contrib redis-server nginx ffmpeg
   ```

3. **Create User**:
   ```bash
   sudo adduser fromabyss
   sudo usermod -aG sudo fromabyss
   ```

### Application Setup

1. **Clone Repository**:
   ```bash
   sudo -u fromabyss git clone https://github.com/your-username/fromabyssdashboard.git /home/fromabyss/fromabyss
   cd /home/fromabyss/fromabyss
   ```

2. **Create Virtual Environment**:
   ```bash
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Configure Database**:
   ```bash
   sudo -u postgres createdb fromabyss
   sudo -u postgres createuser fromabyss
   sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE fromabyss TO fromabyss;"
   ```

4. **Configure Redis**:
   ```bash
   sudo systemctl enable redis-server
   sudo systemctl start redis-server
   ```

### Environment Configuration

Create `.env` file:

```bash
# Django settings
SECRET_KEY=your-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.com,www.your-domain.com

# Database
DATABASE_URL=postgresql://fromabyss:password@localhost:5432/fromabyss

# Redis
REDIS_URL=redis://localhost:6379/0

# File storage
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET_NAME=your-bucket-name
R2_ENDPOINT_URL=https://your-account-id.r2.cloudflarestorage.com

# Social media APIs
TWITTER_API_KEY=your-twitter-api-key
TWITTER_API_SECRET=your-twitter-api-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret

# Spotify API
SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret

# Steam API
STEAM_API_KEY=your-steam-api-key
```

### Gunicorn Configuration

Create `/etc/systemd/system/fromabyss.service`:

```ini
[Unit]
Description=From Abyss Dashboard
After=network.target

[Service]
User=fromabyss
Group=fromabyss
WorkingDirectory=/home/fromabyss/fromabyss
Environment=PATH=/home/fromabyss/fromabyss/venv/bin
ExecStart=/home/fromabyss/fromabyss/venv/bin/gunicorn --workers 3 --bind unix:/home/fromabyss/fromabyss/fromabyss.sock fromabyssdashboard.wsgi:application
ExecReload=/bin/kill -s HUP $MAINPID
Restart=always

[Install]
WantedBy=multi-user.target
```

### Nginx Configuration

Create `/etc/nginx/sites-available/fromabyss`:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location = /favicon.ico { access_log off; log_not_found off; }
    
    location /static/ {
        root /home/fromabyss/fromabyss;
    }

    location /media/ {
        root /home/fromabyss/fromabyss;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/home/fromabyss/fromabyss/fromabyss.sock;
    }
}
```

### SSL Configuration

1. **Install Certbot**:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   ```

2. **Enable Site**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/fromabyss /etc/nginx/sites-enabled
   sudo nginx -t
   sudo systemctl restart nginx
   ```

3. **Obtain SSL Certificate**:
   ```bash
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

### Final Setup

1. **Run Migrations**:
   ```bash
   sudo -u fromabyss /home/fromabyss/fromabyss/venv/bin/python manage.py migrate
   ```

2. **Create Superuser**:
   ```bash
   sudo -u fromabyss /home/fromabyss/fromabyss/venv/bin/python manage.py createsuperuser
   ```

3. **Collect Static Files**:
   ```bash
   sudo -u fromabyss /home/fromabyss/fromabyss/venv/bin/python manage.py collectstatic --noinput
   ```

4. **Start Services**:
   ```bash
   sudo systemctl enable fromabyss
   sudo systemctl start fromabyss
   sudo systemctl restart nginx
   ```

## Environment Variables Reference

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | `django-insecure-...` |
| `DEBUG` | Debug mode | `False` |
| `ALLOWED_HOSTS` | Allowed hostnames | `your-domain.com,www.your-domain.com` |
| `DATABASE_URL` | Database connection | `postgresql://user:pass@host:port/db` |
| `REDIS_URL` | Redis connection | `redis://localhost:6379/0` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `R2_ACCESS_KEY_ID` | Cloudflare R2 access key | `your-access-key` |
| `R2_SECRET_ACCESS_KEY` | Cloudflare R2 secret key | `your-secret-key` |
| `R2_BUCKET_NAME` | R2 bucket name | `fromabyss-media` |
| `R2_ENDPOINT_URL` | R2 endpoint URL | `https://account-id.r2.cloudflarestorage.com` |
| `TWITTER_API_KEY` | Twitter API key | `your-twitter-api-key` |
| `SPOTIFY_CLIENT_ID` | Spotify client ID | `your-spotify-client-id` |
| `STEAM_API_KEY` | Steam API key | `your-steam-api-key` |

## Monitoring and Maintenance

### Logs

- **Application logs**: `sudo journalctl -u fromabyss`
- **Nginx logs**: `/var/log/nginx/access.log`, `/var/log/nginx/error.log`
- **PostgreSQL logs**: `/var/log/postgresql/postgresql-*.log`

### Backup

1. **Database backup**:
   ```bash
   pg_dump fromabyss > backup_$(date +%Y%m%d).sql
   ```

2. **Media files backup**:
   ```bash
   tar -czf media_backup_$(date +%Y%m%d).tar.gz media/
   ```

### Updates

1. **Pull latest code**:
   ```bash
   cd /home/fromabyss/fromabyss
   git pull origin main
   ```

2. **Update dependencies**:
   ```bash
   source venv/bin/activate
   pip install -r requirements.txt
   ```

3. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

4. **Restart services**:
   ```bash
   sudo systemctl restart fromabyss
   sudo systemctl restart nginx
   ```

## Troubleshooting

### Common Issues

1. **Static files not loading**:
   - Check file permissions
   - Verify nginx configuration
   - Run `python manage.py collectstatic`

2. **Database connection errors**:
   - Verify database credentials
   - Check PostgreSQL service status
   - Test connection manually

3. **Redis connection errors**:
   - Check Redis service status
   - Verify Redis URL format
   - Test connection manually

4. **Permission errors**:
   - Check file ownership
   - Verify user permissions
   - Review systemd service configuration

### Performance Optimization

1. **Enable caching**:
   - Configure Redis caching
   - Use CDN for static files
   - Enable database query caching

2. **Database optimization**:
   - Add database indexes
   - Optimize queries
   - Monitor slow queries

3. **Static file optimization**:
   - Enable gzip compression
   - Use CDN for media files
   - Optimize images and videos

## Support

For deployment support:
- Check the troubleshooting section
- Review the logs for error messages
- Contact the development team
