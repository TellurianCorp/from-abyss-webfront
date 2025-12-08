# Patreon Integration Module

A comprehensive Django module for integrating with the Patreon API v2. This module provides full functionality for managing Patreon campaigns, members, posts, and OAuth authentication.

## Features

- **OAuth 2.0 Authentication**: Complete OAuth flow with token refresh
- **Campaign Management**: Fetch and sync campaign data
- **Member Management**: Track patrons and followers
- **Post Management**: Create, read, update, and delete posts
- **Tier Management**: Handle membership tiers and benefits
- **Data Synchronization**: Sync data between Patreon API and local database
- **Admin Interface**: Full Django admin integration
- **Management Commands**: CLI tools for data sync and token management
- **Webhook Support**: Handle Patreon webhooks for real-time updates

## Installation

1. **Add to INSTALLED_APPS** (already done):
   ```python
   INSTALLED_APPS = [
       # ... other apps
       'patreon',
   ]
   ```

2. **Run migrations**:
   ```bash
   python manage.py makemigrations patreon
   python manage.py migrate
   ```

3. **Configure Patreon OAuth App**:
   - Go to [Patreon Developer Portal](https://www.patreon.com/portal/registration/register-clients)
   - Create a new OAuth client
   - Set redirect URI to: `https://yourdomain.com/patreon/oauth/callback/`
   - Note your Client ID and Client Secret

## Configuration

### 1. Create Patreon Credential

1. Go to Django Admin → Patreon → Patreon Credentials
2. Click "Add Patreon Credential"
3. Fill in:
   - **Client ID**: Your Patreon OAuth client ID
   - **Client Secret**: Your Patreon OAuth client secret
   - **Campaign Name**: Optional name for your campaign
   - **Is Active**: Check this to make it the active credential

### 2. Authenticate with Patreon

1. Visit `/patreon/oauth/authorize/` to start OAuth flow
2. Authorize your application on Patreon
3. You'll be redirected back and tokens will be stored automatically

## Usage

### Basic API Usage

```python
from patreon.services import PatreonAPIService
from patreon.models import PatreonCredential

# Get active credential
credential = PatreonCredential.get_active_credential()

# Initialize API service
api_service = PatreonAPIService(credential)

# Get user information
user_info = api_service.get_user_info()

# Get campaigns
campaigns = api_service.get_campaigns()

# Get members for a campaign
members = api_service.get_members(campaign_id="123456")

# Get posts for a campaign
posts = api_service.get_posts(campaign_id="123456")

# Create a post
result = api_service.create_post(
    campaign_id="123456",
    title="My New Post",
    content="This is the content of my post.",
    is_paid=False,
    is_public=True
)
```

### Data Synchronization

```python
# Sync all data for a campaign
results = api_service.sync_campaign_data(campaign_id="123456")

print(f"Synced {len(results['tiers'])} tiers")
print(f"Synced {len(results['members'])} members")
print(f"Synced {len(results['posts'])} posts")
```

### Authentication Management

```python
from patreon.auth import PatreonAuthService

# Initialize auth service
auth_service = PatreonAuthService(credential)

# Check token status
token_info = auth_service.get_token_info()

# Refresh token if needed
if token_info['is_expired']:
    auth_service.refresh_access_token()

# Revoke tokens
auth_service.revoke_tokens()
```

## Management Commands

### Sync Patreon Data

```bash
# Sync all campaigns
python manage.py sync_patreon --all

# Sync specific campaign
python manage.py sync_patreon --campaign-id 123456

# Force sync (ignore recent data)
python manage.py sync_patreon --all --force
```

### Refresh OAuth Tokens

```bash
# Refresh active credential
python manage.py refresh_patreon_tokens

# Refresh all credentials
python manage.py refresh_patreon_tokens --all

# Force refresh
python manage.py refresh_patreon_tokens --force
```

## Models

### PatreonCredential
Stores OAuth credentials and API usage tracking.

**Key fields:**
- `client_id`, `client_secret`: OAuth credentials
- `access_token`, `refresh_token`: OAuth tokens
- `token_expiry`: Token expiration time
- `daily_requests_used`, `daily_requests_limit`: API usage tracking

### PatreonCampaign
Represents a Patreon campaign.

**Key fields:**
- `campaign_id`: Patreon campaign ID
- `name`, `summary`, `description`: Campaign details
- `patron_count`, `pledge_sum`: Campaign statistics
- `is_monthly`, `is_nsfw`, `is_plural`: Campaign settings

### PatreonTier
Represents membership tiers.

**Key fields:**
- `tier_id`: Patreon tier ID
- `title`, `description`: Tier details
- `amount_cents`: Tier price in cents
- `user_limit`, `remaining`: Tier limits

### PatreonMember
Represents campaign members/patrons.

**Key fields:**
- `member_id`: Patreon member ID
- `full_name`, `email`: Member details
- `is_patron`, `is_follower`: Member status
- `lifetime_support_cents`: Total support amount

### PatreonPost
Represents campaign posts.

**Key fields:**
- `post_id`: Patreon post ID
- `title`, `content`, `excerpt`: Post content
- `is_paid`, `is_public`: Post visibility
- `comment_count`, `like_count`: Post statistics

## API Endpoints

### Dashboard
- `/patreon/` - Main dashboard
- `/patreon/campaigns/` - List campaigns
- `/patreon/campaigns/<id>/` - Campaign detail

### Members
- `/patreon/members/` - List all members
- `/patreon/campaigns/<id>/members/` - Campaign members

### Posts
- `/patreon/posts/` - List all posts
- `/patreon/campaigns/<id>/posts/` - Campaign posts
- `/patreon/posts/<id>/` - Post detail
- `/patreon/campaigns/<id>/create-post/` - Create post

### API
- `/patreon/api/status/` - API status and token info
- `/patreon/campaigns/<id>/sync/` - Sync campaign data

### OAuth
- `/patreon/oauth/authorize/` - Start OAuth flow
- `/patreon/oauth/callback/` - OAuth callback

### Webhooks
- `/patreon/webhooks/` - Handle Patreon webhooks

## Webhook Events

The module supports handling these Patreon webhook events:

- `members:pledge:create` - New pledge
- `members:pledge:update` - Pledge update
- `members:pledge:delete` - Pledge deletion
- `posts:publish` - New post published

## Error Handling

The module includes comprehensive error handling:

- **Token Expiration**: Automatic token refresh
- **Rate Limiting**: API usage tracking and limits
- **Network Errors**: Retry logic and error logging
- **Validation**: Input validation and error messages

## Security Considerations

- OAuth tokens are stored securely in the database
- API requests include proper authentication headers
- Webhook signatures can be verified (implementation needed)
- Rate limiting prevents API abuse

## Troubleshooting

### Common Issues

1. **"No active Patreon credential found"**
   - Create a PatreonCredential in Django admin
   - Mark it as active

2. **"Token expired"**
   - Run: `python manage.py refresh_patreon_tokens`
   - Or re-authenticate via OAuth

3. **"Daily request limit reached"**
   - Wait for daily reset
   - Check API usage in admin panel

4. **"OAuth error"**
   - Verify redirect URI matches Patreon app settings
   - Check client ID and secret

### Debug Mode

Enable debug logging in Django settings:

```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'patreon': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Example Script

See `examples/patreon_usage.py` for a complete example of using the Patreon integration.

## Contributing

1. Follow the existing code patterns
2. Add tests for new functionality
3. Update documentation
4. Ensure all migrations work correctly

## License

This module is part of the FromAbyss Dashboard project.
