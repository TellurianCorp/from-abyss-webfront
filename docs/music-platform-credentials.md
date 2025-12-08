# Music Platform Credentials System

This document describes the music platform credential system that allows managing API credentials for various music streaming platforms.

## Overview

The system consists of:

1. **AbstractMusicPlatform** - Abstract base class for all music platform credentials
2. **Platform-specific credential models** - Concrete implementations for each platform
3. **Platform model** - Generic foreign key relationship to any credential type
4. **Utility functions** - Helper functions for managing credentials

## Supported Platforms

- **Spotify** - Spotify Web API (with OAuth 2.0 support)
- **YouTube Music** - YouTube Data API
- **Amazon Music** - Amazon Music API
- **Apple Music** - Apple Music API
- **Deezer** - Deezer API
- **Tidal** - Tidal API

## Models

### AbstractMusicPlatform

Abstract base class that provides common fields and methods:

```python
class AbstractMusicPlatform(models.Model):
    PLATFORM_CHOICES = [
        ('spotify', 'Spotify'),
        ('youtube_music', 'YouTube Music'),
        ('amazon_music', 'Amazon Music'),
        ('apple_music', 'Apple Music'),
        ('deezer', 'Deezer'),
        ('tidal', 'Tidal'),
    ]
    
    name = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    description = models.TextField(blank=True)
    last_validated = models.DateTimeField(null=True, blank=True)
    validation_error = models.TextField(blank=True)

    class Meta:
        abstract = True
```

### Platform-Specific Credential Models

Each platform has its own credential model inheriting from `AbstractMusicPlatform`:

#### SpotifyCredential (with OAuth 2.0)
```python
class SpotifyCredential(AbstractMusicPlatform):
    client_id = models.CharField(max_length=255)
    client_secret = models.CharField(max_length=255)
    access_token = models.CharField(max_length=255, blank=True)
    refresh_token = models.CharField(max_length=255, blank=True)
    token_expiry = models.DateTimeField(blank=True, null=True)
    redirect_uri = models.CharField(max_length=255, blank=True)
    scopes = models.CharField(max_length=500, blank=True)
    
    # OAuth 2.0 Methods
    def get_authorization_url(self, redirect_uri=None, scopes=None, state=None)
    def exchange_code_for_tokens(self, authorization_code, redirect_uri=None)
    def refresh_access_token(self)
    def get_valid_access_token(self)
    def validate_credentials(self)
    def is_token_expired(self)
    def get_token_info(self)
```

#### YouTubeMusicCredential
```python
class YouTubeMusicCredential(AbstractMusicPlatform):
    api_key = models.CharField(max_length=255)
    client_id = models.CharField(max_length=255, blank=True)
    client_secret = models.CharField(max_length=255, blank=True)
    access_token = models.CharField(max_length=255, blank=True)
    refresh_token = models.CharField(max_length=255, blank=True)
```

#### Other Platforms
Similar models exist for Amazon Music, Apple Music, Deezer, and Tidal with their respective API fields.

### Platform Model (musics app)

The `Platform` model in the `musics` app uses a generic foreign key to reference any credential type:

```python
class Platform(models.Model):
    PLATFORM_CHOICES = [
        ('spotify', 'Spotify'),
        ('youtube_music', 'YouTube Music'),
        ('amazon_music', 'Amazon Music'),
        ('apple_music', 'Apple Music'),
        ('deezer', 'Deezer'),
        ('tidal', 'Tidal'),
    ]
    
    name = models.CharField(max_length=50, choices=PLATFORM_CHOICES)
    link = models.URLField()
    
    # Generic foreign key to any music platform credential
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.PositiveIntegerField(null=True, blank=True)
    credential = GenericForeignKey('content_type', 'object_id')
```

## Usage

### Creating Credentials

```python
from credentials.utils import create_platform_credential

# Create a Spotify credential with OAuth
spotify_cred = create_platform_credential(
    platform_name='spotify',
    client_id='your_client_id',
    client_secret='your_client_secret',
    redirect_uri='http://localhost:8000/oauth/callback/',
    scopes='user-read-private user-read-email playlist-read-private',
    description='Production Spotify credentials'
)

# Create a YouTube Music credential
youtube_cred = create_platform_credential(
    platform_name='youtube_music',
    api_key='your_api_key',
    description='YouTube Music API key'
)
```

### Spotify OAuth 2.0 Flow

The Spotify credential model includes full OAuth 2.0 support:

```python
# 1. Generate authorization URL
auth_url = spotify_cred.get_authorization_url()
# Redirect user to auth_url

# 2. Exchange authorization code for tokens
token_data = spotify_cred.exchange_code_for_tokens(authorization_code)

# 3. Get valid access token (auto-refreshes if needed)
access_token = spotify_cred.get_valid_access_token()

# 4. Refresh token manually if needed
token_data = spotify_cred.refresh_access_token()

# 5. Validate credentials
is_valid = spotify_cred.validate_credentials()

# 6. Get token information
token_info = spotify_cred.get_token_info()
```

### Retrieving Credentials

```python
from credentials.utils import get_active_credential_for_platform

# Get active Spotify credential
spotify_cred = get_active_credential_for_platform('spotify')

# Get valid access token (auto-refreshes if expired)
if spotify_cred:
    access_token = spotify_cred.get_valid_access_token()
```

### Associating with Platform

```python
from musics.models import Platform
from credentials.utils import get_active_credential_for_platform

# Get or create platform
platform, created = Platform.objects.get_or_create(
    name='spotify',
    defaults={'link': 'https://open.spotify.com'}
)

# Get active credential
spotify_cred = get_active_credential_for_platform('spotify')

# Associate credential with platform
if spotify_cred:
    platform.credential = spotify_cred
    platform.save()
```

### Retrieving from Platform

```python
# Get platform with its credential
platform = Platform.objects.get(name='spotify')

if platform.credential:
    # Access credential fields
    if hasattr(platform.credential, 'client_id'):
        client_id = platform.credential.client_id
    if hasattr(platform.credential, 'access_token'):
        access_token = platform.credential.get_valid_access_token()
```

### Listing All Credentials

```python
from credentials.utils import get_all_active_credentials

active_credentials = get_all_active_credentials()
for platform_name, credential in active_credentials.items():
    print(f"{platform_name}: {credential}")
```

### Validating Credentials

```python
from credentials.utils import validate_platform_credential

# Validate Spotify credentials
result = validate_platform_credential(
    'spotify',
    client_id='test_id',
    client_secret='test_secret',
    access_token='test_token',
    refresh_token='test_refresh'
)

if result['valid']:
    print("Credentials are valid")
else:
    print(f"Validation failed: {result['error']}")
```

### YouTube Music Validation

YouTube Music credentials can be validated using the YouTube Data API v3:

```python
from credentials.models import YouTubeMusicCredential

# Get active credential
youtube_cred = YouTubeMusicCredential.get_active_credential('youtube_music')

if youtube_cred:
    # Validate credentials by making a test API call
    if youtube_cred.validate_credentials():
        print("✅ YouTube Music credentials are valid!")
        print(f"Last validated: {youtube_cred.last_validated}")
    else:
        print(f"❌ Validation failed: {youtube_cred.validation_error}")
```

The validation process:
1. Checks if API key is provided
2. Makes a test API call to search for music videos
3. Handles various error types (quota exceeded, invalid key, etc.)
4. Updates validation status and error messages

**Command Line Validation:**
```bash
# Validate active credentials only
python manage.py validate_youtube_music_credentials --active-only

# Validate all credentials
python manage.py validate_youtube_music_credentials --all

# Validate specific credential by ID
python manage.py validate_youtube_music_credentials --id 1
```

## Admin Interface

All credential models are registered in the Django admin with:

- List views showing platform name, status, and validation info
- Form fields organized by platform configuration and API credentials
- Validation status display with color coding
- Collapsible sections for validation details and timestamps

### Spotify OAuth Admin Integration

The Spotify credential admin includes special OAuth functionality:

- **OAuth Configuration Fields**: Client ID, Secret, Redirect URI, Scopes
- **OAuth Action Buttons**:
  - "Start OAuth Flow" - Redirects to Spotify authorization
  - "Refresh Token" - Refreshes expired access tokens
  - "Validate Credentials" - Tests API access
- **Token Status Display**: Shows expiry information and token validity
- **Automatic Token Management**: Handles OAuth flow and token refresh

### Accessing Admin

1. Go to Django admin (`/admin/`)
2. Navigate to "Credentials" section
3. You'll see separate admin interfaces for each platform:
   - Spotify Credentials (with OAuth support)
   - YouTube Music Credentials
   - Amazon Music Credentials
   - Apple Music Credentials
   - Deezer Credentials
   - Tidal Credentials

## Utility Functions

The `credentials.utils` module provides several helper functions:

- `get_credential_model_for_platform(platform_name)` - Get credential model class
- `get_active_credential_for_platform(platform_name)` - Get active credential instance
- `create_platform_credential(platform_name, **kwargs)` - Create new credential
- `get_all_active_credentials()` - Get all active credentials
- `get_credential_content_type(credential_instance)` - Get ContentType
- `get_credential_from_content_type(content_type, object_id)` - Get credential from ContentType
- `validate_platform_credential(platform_name, **credentials)` - Validate credentials

## Migration

To apply the database changes:

```bash
python manage.py migrate credentials
python manage.py migrate musics
```

## Example Usage

See `examples/music_platform_usage.py` for general usage examples.
See `examples/spotify_oauth_example.py` for Spotify OAuth 2.0 examples.

## Spotify OAuth 2.0 Setup

To use Spotify OAuth 2.0:

1. **Create a Spotify App**:
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Note your Client ID and Client Secret

2. **Configure Redirect URI**:
   - Add your redirect URI to the app settings
   - For admin integration: `http://yourdomain.com/admin/credentials/spotifycredential/1/oauth-callback/`

3. **Create Credential**:
   - Go to Django admin
   - Create a new Spotify credential
   - Fill in Client ID, Client Secret, and Redirect URI

4. **Start OAuth Flow**:
   - Click "Start OAuth Flow" in the admin
   - Complete authorization on Spotify's website
   - Tokens will be automatically saved

5. **Use in Application**:
   ```python
   spotify_cred = get_active_credential_for_platform('spotify')
   access_token = spotify_cred.get_valid_access_token()
   ```

## Adding New Platforms

To add support for a new music platform:

1. Create a new credential model inheriting from `AbstractMusicPlatform`
2. Add the platform to `PLATFORM_CHOICES` in both models
3. Add the model to `PLATFORM_CREDENTIAL_MODELS` in `utils.py`
4. Create an admin class for the new model
5. Run migrations

Example:

```python
class NewPlatformCredential(AbstractMusicPlatform):
    api_key = models.CharField(max_length=255)
    # Add other platform-specific fields
    
    class Meta:
        verbose_name = 'New Platform Credential'
        verbose_name_plural = 'New Platform Credentials'
```

## Security Considerations

- Credentials are stored in the database
- Consider encrypting sensitive fields if needed
- Use environment variables for development/testing
- Implement proper access controls in production
- Regularly rotate API keys and tokens
- For OAuth flows, always validate state parameters
- Store refresh tokens securely
- Implement proper error handling for token refresh failures
