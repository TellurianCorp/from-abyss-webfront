# Game Trailer System

The Game module now includes functionality to specify which video from the video gallery is a trailer for each game.

## Features

### 🎮 Game Model Updates
- **trailer_video field**: Foreign key to Video model for the primary trailer
- **get_trailer_video()**: Method to get the current trailer video
- **get_available_videos()**: Method to get all videos that could be trailers
- **get_trailer_url()**: Method to get the trailer URL for streaming
- **get_trailer_playlist()**: Method to get trailer in playlist format

### <i class="fas fa-video"></i> Admin Interface
- **Enhanced Game Admin**: Shows trailer video in list and detail views
- **Video Browser**: Visual interface to select trailer videos
- **Video Grid**: Browse all available videos for a game
- **One-Click Selection**: Set any video as trailer with a single click

### <i class="fas fa-cogs"></i> Management Commands
- **set_trailer_videos**: Command-line tool for managing trailer videos
- **link_videos_to_games**: Automatically link videos to games based on title matching
- **test_game_trailers**: Test and debug the game trailers system
- **Auto-assignment**: Automatically set first available video as trailer
- **Status reporting**: List all games and their trailer status

### 📺 Streaming Integration
- **Dynamic Playlist Generation**: Automatically creates playlists from all games with trailers
- **Real-time Updates**: Playlist updates when new trailers are added
- **Fallback Handling**: Graceful handling when no trailers are available
- **Title Overlay**: Shows trailer count in the streaming interface

## Usage

### Setting Trailer Videos via Admin

1. **Navigate to Game Admin**: Go to Django admin → Games → Games
2. **Edit a Game**: Click on any game to edit it
3. **Video Browser**: Scroll down to see the "Trailer Video Selection" section
4. **Select Video**: Click on any video card to set it as the trailer
5. **Browse All Videos**: Use "Browse All Videos" button for full video gallery view

### Setting Trailer Videos via Command Line

```bash
# List all games and their trailer status
python manage.py set_trailer_videos --list

# Set trailer for a specific game (uses first available video)
python manage.py set_trailer_videos --game-id 1

# Automatically set trailers for all games without trailers
python manage.py set_trailer_videos --auto

# Link videos to games based on title matching
python manage.py link_videos_to_games

# Test the game trailers system
python manage.py test_game_trailers --show-data
```

### Using Trailer Data in Code

```python
from games.models import Game

# Get a game
game = Game.objects.get(id=1)

# Get the trailer video object
trailer_video = game.get_trailer_video()

# Get the trailer URL for streaming
trailer_url = game.get_trailer_url()

# Get trailer in playlist format
playlist = game.get_trailer_playlist()

# Get all available videos for this game
available_videos = game.get_available_videos()
```

### Video Requirements

For a video to be available as a trailer:
- **Category**: Must be "Game Trailers"
- **Game Association**: Must be linked to the game
- **Public**: Should be marked as public (recommended)

## Integration with Streaming System

The trailer system integrates with the existing streaming infrastructure:

### Game Trailers Show
The `gametrailers.html` template automatically generates playlists from all games with trailers:

```javascript
// In the streaming template
var showData = {
    trailerUrl: {% if data and data.trailer_url %}'{{ data.trailer_url|escapejs }}'{% else %}null{% endif %},
    playlist: {% if data and data.playlist %}{{ data.playlist|safe }}{% else %}[]{% endif %},
    trailerCount: {% if data and data.trailer_count %}{{ data.trailer_count }}{% else %}0{% endif %},
    gamesCount: {% if data and data.games_count %}{{ data.games_count }}{% else %}0{% endif %}
};
```

### Dynamic Playlist Generation
The system automatically:
- Searches all games for trailer videos
- Creates a playlist with proper metadata
- Handles missing trailers gracefully
- Updates the title overlay with trailer count

### API Integration
Trailer data can be exposed via API endpoints for external consumption.

## Testing and Debugging

### Management Commands for Testing

```bash
# Show system summary
python manage.py test_game_trailers

# Show streaming template data
python manage.py test_game_trailers --show-data

# List all games with trailers
python manage.py test_game_trailers --list-trailers
```

### Manual Testing

1. **Check Trailer Status**: Use `set_trailer_videos --list` to see current status
2. **Test Data Generation**: Use `test_game_trailers --show-data` to verify playlist data
3. **Verify URLs**: Check that trailer URLs are accessible
4. **Test Streaming**: Access the Game Trailers show in the streaming system

## Database Schema

### New Fields
- `games_game.trailer_video`: Foreign key to `posts_video`
- Related name: `game_trailer` (reverse relationship)

### Migrations
- Migration file: `games/migrations/0008_game_trailer_video.py`
- Adds the trailer_video field with proper foreign key relationship

## Best Practices

1. **Video Organization**: Use category "Game Trailers" for trailer videos
2. **Thumbnail Generation**: Generate thumbnails for better preview experience
3. **File Optimization**: Ensure trailer videos are optimized for streaming
4. **Metadata**: Add proper titles and descriptions to trailer videos
5. **Regular Updates**: Use the management command to keep trailer assignments current
6. **Testing**: Regularly test the streaming integration

## Troubleshooting

### No Videos Available
- Check that videos have category "Game Trailers"
- Verify videos are linked to the correct game
- Ensure videos are marked as public
- Use `link_videos_to_games` to automatically link videos

### Admin Interface Issues
- Clear browser cache if video browser doesn't load
- Check that custom templates are in the correct location
- Verify static files are collected

### Management Command Issues
- Ensure you're in the correct Django environment
- Check that the games app is installed
- Verify database migrations are applied

### Streaming Issues
- Use `test_game_trailers --show-data` to verify playlist generation
- Check that trailer videos are public and accessible
- Verify video URLs are correct
- Test with a small subset of trailers first
