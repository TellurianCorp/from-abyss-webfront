# Threads API Setup Guide

## Overview
This guide explains how to set up Threads API credentials for automated posting from the FromAbyss Dashboard.

## Prerequisites
- Meta Developer Account
- Instagram Business Account
- Threads Account (linked to Instagram)

## Step 1: Create Threads App
1. Go to [Meta for Developers](https://developers.facebook.com/)
2. Create a new app or use existing app
3. Add "Threads" product to your app
4. Configure Threads app settings
5. Note your **Threads App ID** and **Threads App Secret**

## Step 2: Configure OAuth Settings
1. In your Meta app, go to App Dashboard > App settings > Basic
2. Add your **Threads App ID** and **Threads App Secret**
3. Configure **Valid OAuth Redirect URIs** (e.g., `https://yourdomain.com/auth/threads/callback`)
4. Ensure your app is in **Development** or **Live** mode

## Step 3: Get Threads Access Token
1. Use the OAuth authorization flow as documented in the [official Threads API guide](https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions/)
2. Request these scopes:
   - `threads_basic` (required)
   - `threads_content_publish` (for posting)
   - `threads_read_replies` (optional, for reading replies)
   - `threads_manage_replies` (optional, for managing replies)
   - `threads_manage_insights` (optional, for analytics)
3. Exchange the authorization code for an access token
4. The access token will be valid for the duration specified by Meta

## Step 4: Add Credentials to Dashboard
1. Go to Django Admin > Credentials > Threads Credentials
2. Click "Add Threads Credential"
3. Fill in the fields:
   - **App ID**: Your Meta app ID
   - **App Secret**: Your Meta app secret
   - **Access Token**: The long-lived Instagram access token
   - **Description**: Optional description
4. Save the credential

## Step 5: Test Publishing
1. Go to Edit Social Post page
2. Click "Publish to Threads" button
3. Check the console for API response
4. Verify the post appears on Threads

## API Endpoints Used

### OAuth Flow
- **Authorization**: `GET https://threads.net/oauth/authorize`
- **Token Exchange**: `POST https://graph.threads.net/oauth/access_token`

### Publishing (Two-Step Process)
Based on [official Threads API documentation](https://developers.facebook.com/docs/threads/posts/):

#### Step 1: Create Media Container
- **Endpoint**: `POST https://graph.threads.net/v1.0/me/threads`
- **Headers**: 
  - `Authorization: Bearer {access_token}`
  - `Content-Type: application/json`
- **Parameters**:
  - `media_type`: `TEXT`, `IMAGE`, `VIDEO`, or `CAROUSEL`
  - `text`: Post content (max 500 characters)
  - `image_url`: For images (must be publicly accessible)
  - `is_carousel_item`: `true` for carousel items
  - `children`: Comma-separated IDs for carousel

#### Step 2: Publish Container
- **Endpoint**: `POST https://graph.threads.net/v1.0/me/threads_publish`
- **Parameters**:
  - `creation_id`: Container ID from Step 1

### Required Parameters for OAuth
- **client_id**: Your Threads App ID
- **client_secret**: Your Threads App Secret  
- **redirect_uri**: Must match your configured OAuth URIs
- **scope**: `threads_basic,threads_content_publish` (minimum required)
- **response_type**: `code`

## Troubleshooting

### Common OAuth Errors
- **400 Bad Request**: Invalid parameters or malformed request
- **401 Unauthorized**: Invalid client credentials or expired token
- **403 Forbidden**: Insufficient permissions or app not approved
- **OAuthException**: Authorization code already used or expired

### Publishing Errors
- **400 Bad Request**: Check post content format and length
- **401 Unauthorized**: Check access token validity
- **403 Forbidden**: Ensure account has Threads enabled and proper permissions
- **Rate Limiting**: Respect API rate limits

### Media Upload Errors
- **Image URL Issues**: Ensure images are publicly accessible via HTTPS
- **URL Format**: Images must be accessible at `https://yourdomain.com//path/to/image.png` (note the double slash)
- **Cloudflare R2 Note**: Some R2 configurations require double slashes for proper routing
- **File Size Limits**: Images max 8MB, videos max 1GB
- **Format Issues**: Use JPEG/PNG for images, MOV/MP4 for videos
- **Processing Delays**: Wait 30 seconds between container creation and publishing
- **Carousel Requirements**: Minimum 2 items, maximum 20 items
- **Image Accessibility**: Threads API must be able to download images via HTTP/HTTPS

### Debugging Steps
1. Verify your Threads App ID and Secret are correct
2. Ensure your redirect URI matches exactly (including trailing slashes)
3. Check that your access token has the required scopes
4. Verify your app is in the correct mode (Development/Live)
5. Check the [official Threads API documentation](https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions/) for latest updates

## Notes
- **Current Implementation**: Full Threads API integration with media support
- **Media Upload**: ✅ **IMPLEMENTED** - Supports images, videos, and carousels
- **Text Posts**: Limited to 500 characters (automatically truncated if longer)
- **Image Support**: JPEG/PNG, max 8MB, aspect ratio 10:1, width 320-1440px
- **Video Support**: MOV/MP4, max 1GB, max 5 minutes, HEVC/H264
- **Carousel Support**: Up to 20 items (images/videos mix)
- **Access Tokens**: Follow Meta's token lifecycle and renewal policies
- **OAuth Flow**: Full OAuth 2.0 implementation with authorization codes
- **API Compliance**: Follows [official Threads API specifications](https://developers.facebook.com/docs/threads/posts/)
- **Testing**: Test thoroughly in development mode before production use

## Security Considerations
- Keep app secrets secure
- Use long-lived tokens for production
- Monitor API usage and rate limits
- Regularly validate credentials
