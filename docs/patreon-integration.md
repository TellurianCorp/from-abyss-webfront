# Patreon Integration

This document covers the complete Patreon integration system, including API sync, post creation, campaign management, and image handling.

## Overview

The Patreon integration provides a comprehensive dashboard for managing Patreon campaigns, posts, members, and tiers. It includes real-time API synchronization, post creation capabilities, and robust image handling for expired CDN URLs.

## Features

### 🎯 Core Functionality
- **Campaign Management**: View and manage Patreon campaigns
- **Post Creation**: Create new posts with rich text editing and Markdown support
- **Member Management**: Track patrons and their subscription status
- **Tier Management**: Manage membership tiers and pricing
- **Real-time Sync**: Automatic synchronization with Patreon API
- **Image Handling**: Automatic caching and fallback for expired Patreon images

### 🔧 Technical Features
- **API v2 Compliance**: Full Patreon API v2 integration
- **Pagination Support**: Handles large datasets across multiple pages
- **Error Recovery**: Graceful error handling and retry mechanisms
- **Authentication**: OAuth 2.0 integration with token refresh
- **Responsive UI**: Modern dark theme matching publisher dashboard

## Setup

### 1. Patreon API Credentials

1. Go to [Patreon Platform Portal](https://www.patreon.com/platform)
2. Create a new client application
3. Note your `Client ID` and `Client Secret`
4. Set redirect URI to: `http://yourdomain.com/patreon/oauth/callback/`

### 2. Django Admin Configuration

1. Access Django Admin: `/admin/patreon/patreoncredential/`
2. Create a new Patreon Credential
3. Fill in:
   - **Client ID**: From Patreon Platform Portal
   - **Client Secret**: From Patreon Platform Portal
   - **Campaign Name**: Your Patreon campaign name
   - **Redirect URI**: `http://yourdomain.com/patreon/oauth/callback/`

### 3. OAuth Authentication

1. Navigate to `/patreon/oauth/authorize/`
2. Complete OAuth flow with Patreon
3. System will automatically store access and refresh tokens

## Usage

### Dashboard Access

**Main Dashboard**: `/patreon/`
- Overview of all campaigns
- API usage statistics
- Recent posts and member counts
- Quick access to all features

### Campaign Management

**Campaign List**: `/patreon/campaigns/`
- View all campaigns
- Sync data from Patreon API
- Access campaign details

**Campaign Details**: `/patreon/campaigns/{id}/`
- Detailed campaign information
- Tier management
- Post creation and management
- Member statistics

### Post Creation

**Create Post**: `/patreon/campaigns/{id}/create-post/`

#### Features:
- **Rich Text Editor**: Markdown support for formatting
- **Content Settings**: Paid/public content toggles
- **Tier Access**: Set minimum pledge amounts
- **Preview**: Real-time content preview
- **Validation**: Client and server-side validation

#### Form Fields:
- **Title**: Post headline (required)
- **Content**: Main post content with Markdown support (required)
- **Paid Content**: Toggle for patron-only content
- **Public Post**: Toggle for public visibility
- **Minimum Pledge**: Required pledge amount in cents

#### Access Points:
1. **Campaign Detail Page**: Green "Create Post" button in header
2. **Posts Section**: "Create Post" button in Recent Posts card
3. **Posts Listing**: "Create Post" button when viewing campaign posts

### Member Management

**Member List**: `/patreon/members/`
- View all patrons across campaigns
- Filter by campaign, status, or search
- Track subscription details and pledge amounts

**Campaign Members**: `/patreon/campaigns/{id}/members/`
- Members specific to a campaign
- Patron status and subscription details

### Tier Management

**Tier List**: `/patreon/tiers/`
- View all membership tiers
- Edit tier details and pricing
- Delete unused tiers

**Campaign Tiers**: `/patreon/campaigns/{id}/tiers/`
- Tiers specific to a campaign
- Create new tiers
- Manage tier benefits and limits

## API Synchronization

### Automatic Sync

The system automatically syncs data from Patreon API with proper error handling and pagination support.

**Sync Command**:
```bash
python manage.py sync_patreon
```

**Features**:
- **Campaigns**: Sync campaign details and metadata
- **Tiers**: Sync membership tiers and pricing
- **Members**: Sync patron information and subscription status
- **Posts**: Sync published posts and content
- **Pagination**: Handles large datasets across multiple API pages
- **Error Recovery**: Continues sync even if some endpoints fail

### Manual Sync

**Campaign Sync**: `/patreon/campaigns/{id}/sync/`
- Sync specific campaign data
- Update tiers, members, and posts
- Refresh campaign statistics

### API Status

**Status Check**: `/patreon/api/status/`
- Verify API connectivity
- Check token validity
- Monitor request limits

## Image Handling

### Automatic Caching

Patreon CDN URLs contain time-limited tokens that expire. The system automatically:

1. **Detects Expired URLs**: Based on token timestamps
2. **Caches Images**: Downloads and stores images locally
3. **Provides Fallbacks**: Shows placeholder images when caching fails
4. **Refreshes Automatically**: Updates images during sync operations

### Manual Image Refresh

```bash
# Refresh all expired images
python manage.py refresh_patreon_images

# Refresh specific model types
python manage.py refresh_patreon_images --model campaign
python manage.py refresh_patreon_images --model member
python manage.py refresh_patreon_images --model post

# Force refresh all images
python manage.py refresh_patreon_images --force
```

### Template Usage

```html
<!-- Automatic image handling with fallback -->
<img src="{{ campaign.image_url }}" 
     alt="{{ campaign.name }}" 
     onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
<div class="placeholder" style="display: none;">
    <i class="fas fa-heart"></i>
</div>
```

## URL Structure

### Main Routes
- `/patreon/` - Dashboard
- `/patreon/campaigns/` - Campaign list
- `/patreon/members/` - Member list
- `/patreon/posts/` - Post list
- `/patreon/tiers/` - Tier list

### Campaign Routes
- `/patreon/campaigns/{id}/` - Campaign details
- `/patreon/campaigns/{id}/edit/` - Edit campaign
- `/patreon/campaigns/{id}/delete/` - Delete campaign
- `/patreon/campaigns/{id}/sync/` - Sync campaign data
- `/patreon/campaigns/{id}/create-post/` - Create post
- `/patreon/campaigns/{id}/members/` - Campaign members
- `/patreon/campaigns/{id}/posts/` - Campaign posts
- `/patreon/campaigns/{id}/tiers/` - Campaign tiers

### OAuth Routes
- `/patreon/oauth/authorize/` - Start OAuth flow
- `/patreon/oauth/callback/` - OAuth callback handler

## Data Models

### PatreonCampaign
- Campaign details and metadata
- Patron counts and revenue statistics
- Image URLs and descriptions

### PatreonTier
- Membership tier information
- Pricing and benefit details
- Patron limits and availability

### PatreonMember
- Patron information and contact details
- Subscription status and pledge amounts
- Campaign and tier relationships

### PatreonPost
- Post content and metadata
- Publication status and visibility
- Campaign and author relationships

## Error Handling

### Common Issues

1. **Authentication Errors**
   - **Symptom**: Redirects to login page
   - **Solution**: Complete OAuth flow at `/patreon/oauth/authorize/`

2. **API Rate Limits**
   - **Symptom**: "Daily request limit reached" error
   - **Solution**: Wait for limit reset or check API usage

3. **Image Loading Issues**
   - **Symptom**: Broken image displays
   - **Solution**: Run `python manage.py refresh_patreon_images`

4. **Sync Failures**
   - **Symptom**: "Could not fetch" errors in logs
   - **Solution**: Check API credentials and network connectivity

### Debugging

**Check API Status**:
```bash
python manage.py shell -c "
from patreon.models import PatreonCredential
cred = PatreonCredential.get_active_credential()
print(f'Token valid: {not cred.is_token_expired()}')
print(f'Requests used: {cred.daily_requests_used}/{cred.daily_requests_limit}')
"
```

**View Sync Logs**:
```bash
python manage.py sync_patreon --verbosity=2
```

## Security Considerations

### OAuth Tokens
- Access tokens are encrypted in the database
- Refresh tokens are used automatically when needed
- Tokens are never logged or exposed in templates

### API Credentials
- Client secrets are stored securely
- Never expose credentials in logs or error messages
- Use environment variables for production deployments

### Data Privacy
- Patron information is handled according to Patreon's data policies
- Email addresses and personal data are protected
- Regular data cleanup for inactive accounts

## Performance Optimization

### Caching
- Images are cached locally to reduce API calls
- Database queries are optimized with proper indexing
- Pagination prevents memory issues with large datasets

### API Efficiency
- Batch requests where possible
- Proper error handling prevents unnecessary retries
- Rate limiting compliance prevents API blocks

## Troubleshooting

### Common Commands

```bash
# Check system status
python manage.py shell -c "
from patreon.models import *
print(f'Campaigns: {PatreonCampaign.objects.count()}')
print(f'Posts: {PatreonPost.objects.count()}')
print(f'Members: {PatreonMember.objects.count()}')
print(f'Tiers: {PatreonTier.objects.count()}')
"

# Test API connectivity
python manage.py shell -c "
from patreon.services import PatreonAPIService
from patreon.models import PatreonCredential
cred = PatreonCredential.get_active_credential()
api = PatreonAPIService(cred)
print(api.get_user_info())
"

# Refresh all data
python manage.py sync_patreon
python manage.py refresh_patreon_images
```

### Log Analysis

Check Django logs for detailed error information:
```bash
tail -f logs/django.log | grep -i patreon
```

## Future Enhancements

### Planned Features
- **Webhook Integration**: Real-time updates from Patreon
- **Analytics Dashboard**: Revenue and growth tracking
- **Bulk Operations**: Mass post creation and management
- **Template System**: Reusable post templates
- **Scheduling**: Scheduled post publication
- **Media Management**: Advanced image and video handling

### API Improvements
- **Webhook Support**: Real-time data updates
- **Advanced Filtering**: More granular data filtering
- **Batch Operations**: Bulk API operations
- **Rate Limit Optimization**: Smarter request management

## Support

For technical support or feature requests:
1. Check this documentation first
2. Review Django logs for error details
3. Test API connectivity and credentials
4. Contact the development team with specific error messages

---

*Last updated: September 2025*
*Version: 2.0*
