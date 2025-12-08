# TMDb (The Movie Database) API Integration

This document describes the TMDb API integration for the FromAbyss Dashboard project, based on the [official TMDb API documentation](https://developer.themoviedb.org/docs/getting-started).

## Overview

The TMDb integration provides comprehensive access to The Movie Database API v3, including movies, TV shows, people, images, videos, and metadata. The integration supports both API key (v3) and access token (v4) authentication methods.

## Features

- **Authentication**: Support for both v3 API keys and v4 access tokens
- **Rate Limiting**: Automatic request tracking and daily limits
- **Comprehensive Coverage**: Movies, TV shows, people, images, videos
- **Multi-language Support**: Internationalization and localization
- **Configuration Data**: Languages, countries, timezones, jobs
- **External IDs**: IMDb, Facebook, Instagram, Twitter links
- **Change Tracking**: Monitor updates to movies, TV shows, and people
- **Trending Content**: Daily and weekly trending items

## Setup

### 1. Get TMDb API Key

1. Visit [TMDb Settings](https://www.themoviedb.org/settings/api)
2. Create an account or log in
3. Request an API key (v3 auth)
4. Optionally request an access token (v4 auth)

### 2. Add Credential to Django Admin

1. Go to Django Admin: `/admin/credentials/tmdbcredential/`
2. Click "Add TMDb Credential"
3. Enter your API key or access token
4. Choose authentication method
5. Add description (optional)
6. Save the credential

### 3. Validate API Key

1. In the credential list, click the validation button
2. The button will show:
   - 🟢 **Green**: Valid credential
   - 🔴 **Red**: Invalid credential
   - 🟡 **Yellow**: Not validated yet

## Usage

### Basic Usage

```python
from credentials.services.tmdb import TMDbService

# Initialize service (uses active credential)
tmdb = TMDbService()

# Search for a movie
results = tmdb.search_movie("The Matrix", year=1999)

# Get detailed movie information
movie = tmdb.get_movie(movie_id, append_to_response='credits,images,videos')

# Get trending movies
trending = tmdb.get_trending('movie', 'day')
```

### Movie Operations

```python
# Search movies
results = tmdb.search_movie("Inception", year=2010)

# Get movie details
movie = tmdb.get_movie(27205, append_to_response='credits,images,videos')

# Get movie credits
credits = tmdb.get_movie_credits(27205)

# Get movie images
images = tmdb.get_movie_images(27205)

# Get movie videos
videos = tmdb.get_movie_videos(27205)

# Get movie recommendations
recommendations = tmdb.get_movie_recommendations(27205)

# Get similar movies
similar = tmdb.get_movie_similar(27205)

# Get external IDs
external_ids = tmdb.get_movie_external_ids(27205)

# Get alternative titles
alt_titles = tmdb.get_movie_alternative_titles(27205)
```

### TV Show Operations

```python
# Search TV shows
results = tmdb.search_tv("Breaking Bad", year=2008)

# Get TV show details
show = tmdb.get_tv_show(1396, append_to_response='credits,images,videos')

# Get season details
season = tmdb.get_tv_season(1396, 1)

# Get episode details
episode = tmdb.get_tv_episode(1396, 1, 1)

# Get external IDs
external_ids = tmdb.get_tv_external_ids(1396)
```

### Person Operations

```python
# Search people
results = tmdb.search_person("Keanu Reeves")

# Get person details
person = tmdb.get_person(6384, append_to_response='credits,images')

# Get movie credits
credits = tmdb.get_person_movie_credits(6384)

# Get external IDs
external_ids = tmdb.get_person_external_ids(6384)
```

### Discovery and Trending

```python
# Get popular movies
popular = tmdb.get_popular_movies(page=1, region='US')

# Get top rated movies
top_rated = tmdb.get_top_rated_movies(page=1)

# Get now playing movies
now_playing = tmdb.get_now_playing_movies(region='US')

# Get upcoming movies
upcoming = tmdb.get_upcoming_movies(region='US')

# Get trending content
trending_movies = tmdb.get_trending('movie', 'day')
trending_tv = tmdb.get_trending('tv', 'week')
trending_all = tmdb.get_trending('all', 'day')

# Discover movies with filters
discovered = tmdb.get_discover_movies(
    language='en-US',
    sort_by='popularity.desc',
    year=2024,
    genre_ids=[28, 12]  # Action, Adventure
)
```

### Configuration and Metadata

```python
# Get API configuration
config = tmdb.get_configuration()

# Get supported languages
languages = tmdb.get_languages()

# Get supported countries
countries = tmdb.get_countries()

# Get jobs and departments
jobs = tmdb.get_jobs()

# Get primary translations
translations = tmdb.get_primary_translations()

# Get timezones
timezones = tmdb.get_timezones()

# Get genres
movie_genres = tmdb.get_genres('movie')
tv_genres = tmdb.get_genres('tv')
```

### Change Tracking

```python
# Get movie changes (last 24 hours by default)
changes = tmdb.get_movie_changes(27205)

# Get changes for specific date range
changes = tmdb.get_movie_changes(
    27205, 
    start_date='2024-01-01', 
    end_date='2024-01-31'
)

# Get TV show changes
tv_changes = tmdb.get_tv_changes(1396)

# Get person changes
person_changes = tmdb.get_person_changes(6384)
```

## Error Handling

The service includes comprehensive error handling:

```python
try:
    results = tmdb.search_movie("Non-existent Movie")
except Exception as e:
    print(f"Error: {e}")
    # Handle error appropriately
```

Common error scenarios:
- **Rate limiting**: Daily request limit exceeded
- **Invalid API key**: Authentication failed
- **Network issues**: Connection problems
- **API errors**: TMDb service issues

## Rate Limiting

The integration includes automatic rate limiting:

- **Daily limits**: Configurable per credential
- **Request tracking**: Automatic counting
- **Limit enforcement**: Prevents exceeding quotas
- **Reset handling**: Daily counter reset

## Image URLs

TMDb provides image URLs that need to be constructed using the configuration:

```python
config = tmdb.get_configuration()
base_url = config['images']['base_url']
poster_sizes = config['images']['poster_sizes']

# Construct poster URL
poster_path = movie['poster_path']
poster_url = f"{base_url}{poster_sizes[2]}{poster_path}"
```

## External IDs

The API provides external IDs for integration with other services:

```python
external_ids = tmdb.get_movie_external_ids(movie_id)

# Available IDs:
# - imdb_id: IMDb identifier
# - facebook_id: Facebook page
# - instagram_id: Instagram account
# - twitter_id: Twitter account
```

## Testing

Use the provided example script to test the integration:

```bash
python examples/tmdb_usage.py
```

This script demonstrates:
- API key validation
- Movie search and details
- Configuration data
- Trending content
- External IDs
- And more...

## Admin Interface

The Django admin provides:

- **Credential Management**: Add, edit, delete credentials
- **Validation Testing**: Test API keys directly
- **Usage Monitoring**: Track request counts
- **Status Indicators**: Visual validation status
- **Error Tracking**: View validation errors

## Best Practices

1. **Use Active Credential**: Always use the active credential for production
2. **Handle Rate Limits**: Implement proper error handling for rate limits
3. **Cache Results**: Cache frequently accessed data
4. **Validate Credentials**: Regularly test API keys
5. **Monitor Usage**: Track daily request counts
6. **Use Appropriate Language**: Set language parameter for internationalization
7. **Include Required Data**: Use `append_to_response` for comprehensive data

## Troubleshooting

### Common Issues

1. **"No active TMDb credential found"**
   - Solution: Add a credential in Django admin and mark it as active

2. **"Daily request limit reached"**
   - Solution: Wait for daily reset or increase limit in credential settings

3. **"TMDb API Error"**
   - Solution: Check API key validity and TMDb service status

4. **"Request failed"**
   - Solution: Check network connectivity and TMDb API availability

### Validation

Use the validation button in Django admin to test credentials:
- Green button: Credential is valid
- Red button: Credential has errors
- Yellow button: Credential not tested yet

## API Reference

For complete API documentation, visit:
- [TMDb API Documentation](https://developer.themoviedb.org/docs/getting-started)
- [TMDb API Reference](https://developer.themoviedb.org/reference)

## Support

For issues with the TMDb integration:
1. Check the Django admin for validation errors
2. Review the TMDb API documentation
3. Test with the example script
4. Check network connectivity
5. Verify API key permissions
