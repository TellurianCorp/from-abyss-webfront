# YouTube Music Credential Validation

This document describes the YouTube Music credential validation system implemented in the FromAbyss Dashboard.

## Overview

The YouTube Music credential validation system allows you to verify that your YouTube Data API credentials are working correctly by making test API calls.

## Features

- **Real-time validation**: Test credentials by making actual API calls
- **Error handling**: Detailed error messages for various failure scenarios
- **Admin interface**: Validate credentials directly from Django admin
- **Command line tools**: Validate credentials from the command line
- **Status tracking**: Track validation history and error messages

## Validation Process

The validation process performs the following steps:

1. **API Key Check**: Verifies that a YouTube Data API key is provided
2. **API Call**: Makes a test search request for music videos
3. **Error Analysis**: Handles various YouTube API error types:
   - `quotaExceeded`: API quota has been exceeded
   - `keyInvalid`: API key is invalid
   - `keyExpired`: API key has expired
   - `accessNotConfigured`: YouTube Data API v3 is not enabled
4. **Status Update**: Updates validation timestamp and error messages

## Usage

### Django Admin Interface

1. Navigate to **Admin > Credentials > YouTube Music Credentials**
2. Select a credential to edit
3. Click the **"🔍 Validate Credentials"** button in the top right
4. View validation results in the status section

### Command Line

```bash
# Validate active credentials only (default)
python manage.py validate_youtube_music_credentials --active-only

# Validate all credentials
python manage.py validate_youtube_music_credentials --all

# Validate specific credential by ID
python manage.py validate_youtube_music_credentials --id 1
```

### Python Code

```python
from credentials.models import YouTubeMusicCredential

# Get active credential
youtube_cred = YouTubeMusicCredential.get_active_credential('youtube_music')

if youtube_cred:
    # Validate credentials
    if youtube_cred.validate_credentials():
        print("✅ Credentials are valid!")
        print(f"Last validated: {youtube_cred.last_validated}")
    else:
        print(f"❌ Validation failed: {youtube_cred.validation_error}")
```

## Error Types

| Error Type | Description | Solution |
|------------|-------------|----------|
| `API key is required` | No API key provided | Add a YouTube Data API key |
| `API quota exceeded` | Daily quota limit reached | Wait for quota reset or increase quota |
| `Invalid API key` | API key is malformed or invalid | Check API key format and validity |
| `API key has expired` | API key has expired | Generate a new API key |
| `YouTube Data API v3 is not enabled` | API not enabled in Google Cloud Console | Enable YouTube Data API v3 |

## Setup Requirements

1. **Google Cloud Console**: Create a project and enable YouTube Data API v3
2. **API Key**: Generate an API key with appropriate restrictions
3. **Quota**: Ensure sufficient daily quota for validation calls

## Testing

Run the test script to verify validation functionality:

```bash
python test_youtube_music_validation.py
```

## Admin Actions

The admin interface includes:

- **Bulk validation**: Select multiple credentials and validate them at once
- **Status display**: Color-coded validation status in list view
- **Error details**: Detailed error messages in the change form
- **Validation history**: Track when credentials were last validated

## Integration

The validation system integrates with:

- **Music Platform System**: Works with the generic music platform credential system
- **Admin Interface**: Seamless integration with Django admin
- **Management Commands**: Command-line tools for automation
- **Error Tracking**: Persistent error message storage

## Troubleshooting

### Common Issues

1. **"API quota exceeded"**: Wait for quota reset or increase quota limits
2. **"Invalid API key"**: Verify API key format and restrictions
3. **"API not enabled"**: Enable YouTube Data API v3 in Google Cloud Console
4. **Network errors**: Check internet connectivity and firewall settings

### Debug Mode

Enable debug logging to see detailed API call information:

```python
import logging
logging.getLogger('googleapiclient').setLevel(logging.DEBUG)
```

## Security Notes

- API keys are stored in the database and should be protected
- Validation calls count against your API quota
- Consider implementing rate limiting for validation calls
- Use appropriate API key restrictions in Google Cloud Console
