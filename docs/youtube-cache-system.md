# YouTube API Cache System

## Overview

The YouTube API cache system is designed to prevent rate limit issues by intelligently caching YouTube API responses and providing fallback mechanisms when the API is unavailable.

## Features

- **Intelligent Caching**: Caches video IDs, channel IDs, and error states
- **Rate Limit Protection**: Detects rate limit errors and uses cached data
- **Error Handling**: Comprehensive error tracking and user feedback
- **Management Commands**: Django management commands for cache administration
- **Fallback Mechanisms**: Graceful degradation when API is unavailable

## Cache Configuration

The cache system uses the following configuration in `frontend/views.py`:

```python
YOUTUBE_CACHE_CONFIG = {
    'VIDEO_ID_CACHE_KEY': 'youtube_latest_video_fromabyssmedia',
    'CHANNEL_ID_CACHE_KEY': 'youtube_channel_id_fromabyssmedia',
    'ERROR_CACHE_KEY': 'youtube_error_fromabyssmedia',
    'VIDEO_CACHE_TIMEOUT': 60 * 60 * 6,  # 6 hours for video ID
    'CHANNEL_CACHE_TIMEOUT': 60 * 60 * 24 * 7,  # 7 days for channel ID
    'ERROR_CACHE_TIMEOUT': 60 * 30,  # 30 minutes for errors
    'MAX_RETRIES': 3,
    'RETRY_DELAY': 60,  # seconds
}
```

## Cache Manager

The `YouTubeCacheManager` class provides methods for:

- `get_cached_video_id()`: Retrieve cached video ID
- `set_cached_video_id(video_id, timeout)`: Cache video ID
- `get_cached_channel_id()`: Retrieve cached channel ID
- `set_cached_channel_id(channel_id)`: Cache channel ID
- `set_error(error_type, error_message, timeout)`: Cache error information
- `get_error_info()`: Retrieve cached error information

## Error Types

The system tracks different types of errors:

- `rate_limit`: API quota exceeded
- `invalid_key`: Invalid API key
- `api_not_enabled`: YouTube Data API not enabled
- `credential_error`: No valid credentials
- `channel_not_found`: Channel not found
- `unexpected_error`: Unexpected errors

## Management Commands

### Check Cache Status
```bash
python manage.py manage_youtube_cache --status
```

### Clear All Cache
```bash
python manage.py manage_youtube_cache --clear
```

### Clear Error Cache Only
```bash
python manage.py manage_youtube_cache --clear-errors
```

### Force Refresh
```bash
python manage.py manage_youtube_cache --force-refresh
```

## Testing

Run the test script to verify cache functionality:

```bash
python scripts/test_youtube_cache.py
```

## Widget States

The YouTube widget displays different states:

1. **Normal**: Shows embedded video
2. **Loading**: Shows loading indicator
3. **Rate Limited**: Shows warning with cached video
4. **Error**: Shows error message with details

## CSS Classes

The widget uses these CSS classes for different states:

- `.youtube-loading`: Loading state
- `.youtube-error`: Error state
- `.youtube-rate-limited`: Rate limit state
- `.cache-info`: Cache information
- `.error-details`: Error details
- `.error-type`: Error type information

## Implementation Details

### Cache Strategy

1. **Video ID Cache**: 6-hour timeout, refreshed when new video is fetched
2. **Channel ID Cache**: 7-day timeout, rarely changes
3. **Error Cache**: 30-minute timeout, prevents repeated API calls during errors

### Rate Limit Handling

When a rate limit error is detected:
1. Error is cached with extended timeout
2. Last known video ID is returned if available
3. Widget shows rate limit warning
4. API calls are avoided until error cache expires

### Fallback Behavior

- If no cached video ID exists and API fails, widget shows error
- If cached video ID exists but API fails, widget shows cached video with warning
- Channel ID is cached to reduce API calls for channel lookup

## Monitoring

Monitor cache effectiveness by:

1. Checking cache status with management commands
2. Reviewing Django logs for cache hits/misses
3. Monitoring YouTube API quota usage
4. Observing widget behavior during API outages

## Troubleshooting

### Common Issues

1. **Cache not working**: Check Django cache backend configuration
2. **Rate limits still occurring**: Verify error cache is being set correctly
3. **Widget not updating**: Check if cache timeout is too long

### Debug Commands

```bash
# Check current cache state
python manage.py manage_youtube_cache --status

# Clear cache and force refresh
python manage.py manage_youtube_cache --force-refresh

# Test cache functionality
python scripts/test_youtube_cache.py
```

## Future Improvements

- Add cache warming for popular pages
- Implement cache invalidation on new video uploads
- Add metrics collection for cache performance
- Consider Redis for better cache performance
