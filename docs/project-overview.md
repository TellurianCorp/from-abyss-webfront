# From Abyss Dashboard - Project Overview

## Introduction

The From Abyss Dashboard is a comprehensive content management and publishing platform designed for the From Abyss project. It provides tools for managing social media content, video galleries, podcasts, gaming data, and various data sources in a unified interface.

## Project Structure

### Core Django Apps

- **`posts/`** - Social media post management and publishing
- **`credentials/`** - API credentials and service integrations
- **`datasources/`** - RSS/Atom feed management and data aggregation
- **`podcasts/`** - Podcast episode management and Spotify integration
- **`games/`** - Gaming data management and Steam integration
- **`contacts/`** - Contact management system
- **`stations/`** - Radio station management
- **`editorial/`** - Editorial content management
- **`frontend/`** - Frontend components and views
- **`horror_trends/`** - Horror trends analysis

### Supporting Directories

- **`templates/`** - Django HTML templates
- **`static/`** - Static assets (CSS, JS, images, fonts)
- **`data_models/`** - YAML data files for various content types
- **`tools/`** - Standalone utility scripts
- **`gui/`** - Electron desktop application
- **`bucket/`** - File storage for uploaded content

## Key Features

### Content Management
- Social media post creation and scheduling
- Video gallery with tagging and playlist support
- Podcast episode management with Spotify integration
- Gaming data synchronization with Steam
- RSS/Atom feed aggregation and management

### Publishing Tools
- Multi-platform social media publishing
- Automated content generation
- Image and video processing
- SEO optimization tools

### Data Integration
- Steam API integration for gaming data
- Spotify API for podcast management
- Various social media platform APIs
- RSS/Atom feed processing

### User Interface
- Modern, responsive web interface
- Dark theme optimized for content creators
- Mobile-friendly design
- Streaming overlay components

## Technology Stack

### Backend
- **Django 4.2+** - Web framework
- **Python 3.8+** - Programming language
- **PostgreSQL** - Database (recommended)
- **Redis** - Caching and session storage

### Frontend
- **HTML5/CSS3** - Markup and styling
- **JavaScript** - Client-side functionality
- **Bootstrap** - UI framework
- **Custom CSS** - From Abyss branding

### External Services
- **Cloudflare R2** - File storage
- **Steam API** - Gaming data
- **Spotify API** - Podcast management
- **Various social media APIs** - Content publishing

## Development Setup

### Prerequisites
- Python 3.8+
- Node.js (for GUI development)
- FFmpeg (for video processing)
- PostgreSQL (recommended)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd fromabyssdashboard

# Create virtual environment
python -m venv .env
source .env/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Run development server
python manage.py runserver
```

### Environment Configuration
- Copy and configure environment variables
- Set up database connections
- Configure external service credentials
- Set up file storage (Cloudflare R2 recommended)

## Deployment

### Railway Deployment
The project includes Railway deployment configuration:
- `config/railway.toml` - Railway configuration
- `config/nixpacks.toml` - Build configuration
- `config/Procfile` - Process definitions
- `config/Dockerfile` - Container configuration

### Manual Deployment
- Configure production settings
- Set up static file serving
- Configure database
- Set up SSL certificates
- Configure external services

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the From Abyss project and follows the same licensing terms.

## Support

For support and questions:
- Check the documentation in the `docs/` directory
- Review the troubleshooting guides
- Contact the development team
