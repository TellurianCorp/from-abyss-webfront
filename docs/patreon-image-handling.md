# Patreon Image Handling

## Problem

Patreon CDN URLs contain time-limited tokens that expire, causing images to become inaccessible. This results in broken image displays in the Patreon dashboard.

Example of expired URL:
```
https://c10.patreonusercontent.com/4/patreon-media/p/campaign/10385073/97043a2b64a143feb406a19e6d69a288/eyJ3IjoxOTIwLCJ3ZSI6MX0%3D/2.png?token-hash=UfX6TQAM7EWdmeJ554LFyJ4tqcTecw3fZEiC_h8I8tA%3D&token-time=1756944000
```

## Solution

The Patreon integration now includes an automatic image caching system that:

1. **Detects expired URLs** by checking the `token-time` parameter
2. **Downloads and caches images** locally to prevent future expiration
3. **Provides fallback placeholders** for missing or failed images
4. **Automatically refreshes** images during sync operations

## Features

### Image Caching System

- **Automatic Detection**: Identifies expired Patreon URLs based on token timestamps
- **Local Storage**: Downloads and caches images to prevent future expiration
- **Fallback Handling**: Shows placeholder images when URLs are unavailable
- **Template Filters**: Easy-to-use template filters for safe image display

### Management Commands

#### Refresh Expired Images
```bash
# Refresh all expired images
python manage.py refresh_patreon_images

# Refresh specific model types
python manage.py refresh_patreon_images --model campaign
python manage.py refresh_patreon_images --model member
python manage.py refresh_patreon_images --model post

# Force refresh all images (not just expired)
python manage.py refresh_patreon_images --force
```

#### Sync with Image Refresh
```bash
# Sync Patreon data and refresh images
python manage.py sync_patreon --all
```

### Template Usage

#### Basic Image Display
```django
<!-- Automatically handles expired URLs and provides fallbacks -->
<img src="{{ campaign.image_url|patreon_image_url:'campaign' }}" alt="{{ campaign.name }}">
```

#### Safe Image Display
```django
<!-- Returns complete img tag with fallback handling -->
{{ campaign.image_url|patreon_image_safe:"campaign" }}
```

#### Check URL Expiration
```django
<!-- Check if URL is expired -->
{% if campaign.image_url|is_patreon_url_expired %}
    <span class="badge badge-warning">Image URL Expired</span>
{% endif %}
```

## Configuration

### Cache Settings

Images are cached in the `patreon_images/` directory within your media storage. The system:

- **Cache Duration**: 30 days (configurable in `PatreonImageHandler.max_age_days`)
- **Storage Location**: Uses Django's default storage system
- **File Naming**: MD5 hash of original URL for uniqueness

### Placeholder Images

The system provides different placeholder images based on content type:

- **Campaign**: `/static/img/patreon-campaign-placeholder.png`
- **Member**: `/static/img/patreon-member-placeholder.png`
- **Post**: `/static/img/patreon-post-placeholder.png`

## Automatic Refresh

The image refresh system is automatically triggered during:

1. **Patreon Sync Operations**: Images are refreshed after each sync
2. **Template Rendering**: Expired URLs are detected and cached on-demand
3. **Manual Commands**: Use management commands for bulk refresh

## Monitoring

### Logs

The system logs image operations:

```
INFO: Cached Patreon image: https://... -> patreon_images/abc123.jpg
WARNING: Failed to cache Patreon image https://...: Connection timeout
```

### Admin Interface

Check the Django admin for:

- **Patreon Campaigns**: View cached image URLs
- **Patreon Members**: Monitor member avatars
- **Patreon Posts**: Track post images

## Troubleshooting

### Common Issues

1. **Images Still Not Loading**
   - Check if placeholder images exist in `/static/img/`
   - Verify media storage is properly configured
   - Run `python manage.py refresh_patreon_images --force`

2. **Cache Not Working**
   - Ensure media storage has write permissions
   - Check Django's `MEDIA_ROOT` and `MEDIA_URL` settings
   - Verify the `patreon_images/` directory exists

3. **Sync Issues**
   - Ensure Patreon credentials are valid
   - Check API rate limits
   - Review sync command logs

### Manual Image Refresh

If automatic refresh fails, manually refresh specific images:

```python
from patreon.utils import patreon_image_handler
from patreon.models import PatreonCampaign

# Refresh all campaign images
patreon_image_handler.refresh_expired_images(PatreonCampaign, 'image_url')
```

## Best Practices

1. **Regular Sync**: Run sync commands regularly to keep images fresh
2. **Monitor Logs**: Check for failed image downloads
3. **Backup Cache**: Include cached images in backups
4. **Storage Space**: Monitor disk usage for cached images
5. **CDN Integration**: Consider serving cached images through a CDN

This system ensures that Patreon images remain accessible even after their original CDN URLs expire, providing a seamless user experience in the dashboard.
