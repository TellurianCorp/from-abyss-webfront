# OMDb API Integration

This document describes the OMDb (Open Movie Database) API integration in the FromAbyss Dashboard.

## Overview

The OMDb API provides access to movie and TV show information from IMDb. This integration allows you to:

- Search for movies by title
- Get detailed movie information
- Search by IMDb ID
- Track API usage and rate limits

## Setup

### 1. Get an API Key

1. Visit [OMDb API](https://www.omdbapi.com/apikey.aspx)
2. Choose the free tier (1,000 daily requests)
3. Enter your email address
4. Check your email for the API key

### 2. Add Credentials

1. Go to Django Admin → Credentials → OMDb Credentials
2. Click "Add OMDb Credential"
3. Enter your API key
4. Add an optional description
5. Save the credential

### 3. Validate the API Key

1. In the admin interface, click "Validate API Key" button
2. The system will test the key with a sample request
3. If valid, you'll see a success message

## Usage

### Using the Service Class

```python
from credentials.services.omdb import OMDbService

# Get service with active credential
service = OMDbService.get_active_service()

# Search for a movie
movie_data = service.search_movie("The Matrix", year=1999)

# Get detailed information
detailed_data = service.get_movie_details("The Matrix", year=1999)

# Search by IMDb ID
movie_data = service.search_by_id("tt0133093")

# Search for multiple movies
results = service.search_movies("Matrix", year=1999)

# Check usage
usage = service.get_usage_info()
print(f"Used: {usage['used']}/{usage['limit']} requests today")
```

### Using the Model Directly

```python
from credentials.models import OMDbCredential

# Get active credential
credential = OMDbCredential.get_active_credential()

# Check if valid
if credential.is_valid():
    print("Credential is valid")

# Check usage
usage = credential.get_usage_info()
print(f"Remaining requests: {usage['remaining']}")

# Validate API key
if credential.validate_api_key():
    print("API key is working")
```

### Management Command

Test the integration using the management command:

```bash
# Test with default movie (The Matrix)
python manage.py test_omdb

# Test with specific movie
python manage.py test_omdb --movie "Inception" --year 2010

# Search for multiple movies
python manage.py test_omdb --search "Matrix"
```

## API Features

### Rate Limiting

- Free tier: 1,000 requests per day
- The system automatically tracks daily usage
- Requests are recorded and counted
- Daily limits reset at midnight

### Available Methods

- `search_movie(title, year=None, plot='short')` - Search by title
- `search_by_id(imdb_id, plot='short')` - Search by IMDb ID
- `search_movies(search_term, year=None, type_='movie', page=1)` - Search multiple results
- `get_movie_details(title, year=None)` - Get full plot and details

### Response Data

The API returns movie information including:

- Title, Year, Director
- Genre, Plot, Rating
- IMDb ID, Poster URL
- Cast, Awards, and more

## Error Handling

The service includes comprehensive error handling:

- Invalid API keys
- Rate limit exceeded
- Network errors
- API errors

All errors are logged and can be viewed in the admin interface.

## Admin Interface

The Django admin provides:

- Credential management
- API key validation
- Usage tracking
- Error logging
- Request history

## Troubleshooting

### Common Issues

1. **"No active OMDb credential found"**
   - Create a credential in the admin interface
   - Ensure it's marked as active

2. **"Daily request limit reached"**
   - Wait until tomorrow for the limit to reset
   - Check usage in the admin interface

3. **"Invalid API key"**
   - Verify the key is correct
   - Check if the key is active
   - Test the key on the OMDb website

### Validation

Use the validation button in the admin to test your API key. This will:

- Make a test request to the API
- Update the validation status
- Show any error messages
- Record the validation timestamp
