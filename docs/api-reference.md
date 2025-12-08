# API Reference

## Overview

This document provides a comprehensive reference for all API endpoints in the From Abyss Dashboard.

## Authentication

Most API endpoints require authentication. Use Django's session-based authentication or token-based authentication for API access.

## Base URL

All API endpoints are relative to the base URL of your deployment.

## Endpoints

### Posts API

#### Get All Posts
```
GET /api/posts/
```
Returns a list of all posts with pagination.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `status` - Filter by status (draft, published, scheduled)
- `platform` - Filter by platform (twitter, facebook, instagram, etc.)

**Response:**
```json
{
  "count": 100,
  "next": "http://example.com/api/posts/?page=2",
  "previous": null,
  "results": [
    {
      "id": 1,
      "title": "Post Title",
      "content": "Post content...",
      "status": "published",
      "platform": "twitter",
      "created_at": "2024-01-01T00:00:00Z",
      "published_at": "2024-01-01T12:00:00Z"
    }
  ]
}
```

#### Create Post
```
POST /api/posts/
```
Create a new post.

**Request Body:**
```json
{
  "title": "Post Title",
  "content": "Post content...",
  "platform": "twitter",
  "status": "draft",
  "scheduled_at": "2024-01-01T12:00:00Z"
}
```

#### Get Post by ID
```
GET /api/posts/{id}/
```
Returns a specific post by ID.

#### Update Post
```
PUT /api/posts/{id}/
PATCH /api/posts/{id}/
```
Update an existing post.

#### Delete Post
```
DELETE /api/posts/{id}/
```
Delete a post.

### Video Gallery API

#### Get All Videos
```
GET /api/videos/
```
Returns a list of all videos.

**Query Parameters:**
- `category` - Filter by category
- `tags` - Filter by tags (comma-separated)
- `public` - Filter by public status (true/false)

#### Upload Video
```
POST /api/videos/
```
Upload a new video file.

**Request Body (multipart/form-data):**
- `file` - Video file
- `title` - Video title
- `description` - Video description
- `category` - Video category
- `tags` - Comma-separated tags
- `public` - Public status (true/false)

#### Generate Thumbnail
```
POST /api/videos/{id}/thumbnail/
```
Generate a thumbnail for a video.

**Request Body:**
```json
{
  "time": 30.5
}
```

### Podcasts API

#### Get All Podcasts
```
GET /api/podcasts/
```
Returns a list of all podcast episodes.

#### Get Podcast by ID
```
GET /api/podcasts/{id}/
```
Returns a specific podcast episode.

#### Sync with Spotify
```
POST /api/podcasts/sync-spotify/
```
Sync podcast episodes with Spotify.

### Games API

#### Get All Games
```
GET /api/games/
```
Returns a list of all games.

#### Sync with Steam
```
POST /api/games/sync-steam/
```
Sync games data with Steam API.

### Feeds API

#### Get All Feeds
```
GET /api/feeds/
```
Returns a list of all RSS/Atom feeds.

#### Import Feeds
```
POST /api/feeds/import/
```
Import feeds from JSON file.

**Request Body:**
```json
{
  "feeds": [
    {
      "title": "Feed Title",
      "url": "https://example.com/feed.xml",
      "description": "Feed description",
      "feed_type": "rss"
    }
  ]
}
```

### Contacts API

#### Get All Contacts
```
GET /api/contacts/
```
Returns a list of all contacts.

#### Create Contact
```
POST /api/contacts/
```
Create a new contact.

**Request Body:**
```json
{
  "name": "Contact Name",
  "email": "contact@example.com",
  "phone": "+1234567890",
  "notes": "Contact notes"
}
```

### Stations API

#### Get All Stations
```
GET /api/stations/
```
Returns a list of all radio stations.

#### Get Station by ID
```
GET /api/stations/{id}/
```
Returns a specific station.

## Error Responses

All API endpoints return consistent error responses:

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Invalid request data",
  "details": {
    "field_name": ["Error message"]
  }
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 403 Forbidden
```json
{
  "error": "Forbidden",
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Authenticated users**: 1000 requests per hour
- **Anonymous users**: 100 requests per hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)

Pagination metadata is included in responses:
```json
{
  "count": 100,
  "next": "http://example.com/api/endpoint/?page=2",
  "previous": null,
  "results": [...]
}
```

## Filtering and Sorting

Many endpoints support filtering and sorting:

### Filtering
Use query parameters to filter results:
```
GET /api/posts/?status=published&platform=twitter
```

### Sorting
Use the `ordering` parameter to sort results:
```
GET /api/posts/?ordering=-created_at
GET /api/posts/?ordering=title
```

## File Uploads

For file uploads (videos, images), use `multipart/form-data`:

```bash
curl -X POST \
  -H "Authorization: Token your-token" \
  -F "file=@video.mp4" \
  -F "title=My Video" \
  -F "description=Video description" \
  http://example.com/api/videos/
```

## Webhooks

The API supports webhooks for real-time notifications:

### Configure Webhook
```
POST /api/webhooks/
```

**Request Body:**
```json
{
  "url": "https://your-app.com/webhook",
  "events": ["post.created", "post.published"],
  "secret": "webhook-secret"
}
```

### Webhook Events
- `post.created` - New post created
- `post.published` - Post published
- `post.updated` - Post updated
- `post.deleted` - Post deleted
- `video.uploaded` - Video uploaded
- `podcast.synced` - Podcast synced

## SDKs and Libraries

### Python
```python
import requests

# Get posts
response = requests.get('http://example.com/api/posts/')
posts = response.json()

# Create post
data = {
    'title': 'My Post',
    'content': 'Post content...',
    'platform': 'twitter'
}
response = requests.post('http://example.com/api/posts/', json=data)
```

### JavaScript
```javascript
// Get posts
fetch('/api/posts/')
  .then(response => response.json())
  .then(data => console.log(data));

// Create post
fetch('/api/posts/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    title: 'My Post',
    content: 'Post content...',
    platform: 'twitter'
  })
});
```

## Testing

Use the provided test endpoints for development:

```
GET /api/test/posts/
POST /api/test/posts/
```

Test endpoints return sample data and don't affect production data.

## Support

For API support:
- Check the error messages for debugging
- Review the rate limiting headers
- Contact the development team for issues
