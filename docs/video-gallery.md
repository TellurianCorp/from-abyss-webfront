# Video Gallery Organizer

A comprehensive video management system for the From Abyss Publisher Dashboard with support for video uploads, tagging, playlists, and thumbnail generation.

## Features

### <i class="fas fa-video"></i> Video Management
- **Upload Videos**: Drag-and-drop interface for video uploads
- **Organize by Subdirectories**: Videos are organized in `/videos/{subdirectory}/` structure
- **Metadata Extraction**: Automatic extraction of duration, resolution, file size, and format
- **Video Preview**: Built-in video player with controls
- **Edit & Delete**: Full CRUD operations for video management

### <i class="fas fa-tags"></i> Tagging System
- **Custom Tags**: Create and manage video tags with custom colors
- **Tag Filtering**: Filter videos by tags in the gallery
- **Tag Management**: Dedicated interface for creating, editing, and deleting tags
- **Visual Tags**: Color-coded tags for easy identification

### <i class="fas fa-list"></i> Playlist Management
- **JSON Configuration**: Flexible playlist configuration with JSON settings
- **Drag & Drop Reordering**: Intuitive drag-and-drop interface for playlist management
- **Playlist Export**: Export playlists as JSON files
- **Playlist Duplication**: Clone existing playlists
- **Batch Operations**: Add multiple videos to playlists at once

### <i class="fas fa-image"></i> Thumbnail Generation
- **Timeline Thumbnails**: Generate thumbnails from any point in the video timeline
- **FFmpeg Integration**: Uses FFmpeg for high-quality thumbnail generation
- **Automatic Upload**: Thumbnails are automatically uploaded to cloud storage
- **Preview Support**: Thumbnails are displayed in video cards and playlists

### <i class="fas fa-search"></i> Advanced Features
- **Search & Filter**: Advanced search functionality with multiple filter options
- **Batch Operations**: Select and manage multiple videos at once
- **Keyboard Shortcuts**: Quick access to common operations
- **Responsive Design**: Mobile-friendly interface
- **Cloud Storage**: Automatic upload to Cloudflare R2 storage

## Installation & Setup

### Prerequisites
- Django 4.2+
- FFmpeg (for thumbnail generation)
- Cloudflare R2 storage (for file hosting)
- Python 3.8+

### Dependencies
```bash
pip install django-redis
pip install boto3
```

### Database Migration
```bash
python manage.py makemigrations posts
python manage.py migrate
```

### FFmpeg Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install ffmpeg

# macOS
brew install ffmpeg

# Windows
# Download from https://ffmpeg.org/download.html
```

## Usage

### Accessing the Video Gallery
1. Navigate to the Publisher Dashboard
2. Click on "Video Gallery" in the navigation menu
3. Or visit `/studio/videos/`

### Uploading Videos
1. Click "Upload Video" button
2. Drag and drop video files or click to select
3. Fill in video details:
   - Title (required)
   - Description
   - Category
   - Subdirectory (for organization)
   - Tags (comma-separated)
   - Thumbnail time (seconds)
   - Public/Private setting
   - Featured video setting
4. Click "Upload Video"

### Managing Tags
1. Click "Manage Tags" button
2. Create new tags with custom colors
3. Edit existing tags
4. Delete unused tags
5. Tags are automatically applied to videos

### Creating Playlists
1. Click "Manage Playlists" button
2. Click "Create New Playlist"
3. Fill in playlist details:
   - Name (required)
   - Description
   - JSON configuration
   - Select videos
   - Public/Private setting
4. Click "Create Playlist"

### Generating Thumbnails
1. In the video gallery, click the thumbnail icon on any video
2. Enter the time in seconds for thumbnail generation
3. Click "Generate Thumbnail"
4. Thumbnail will be created and displayed

### Playing Videos
1. Click the "Play" button on any video card
2. Videos open in a modal player
3. For playlists, click "Play Playlist" to start sequential playback

## File Structure

```
videos/
├── horror/           # Subdirectory example
│   ├── video1.mp4
│   └── video2.webm
├── gameplay/
│   └── video3.mp4
└── thumbnails/
    ├── thumbnail_1_0.jpg
    └── thumbnail_2_30.jpg
```

## API Endpoints

### Video Management
- `GET /studio/videos/` - Video gallery
- `POST /studio/videos/` - Upload video
- `GET /studio/videos/edit/<id>/` - Edit video
- `POST /studio/videos/edit/<id>/` - Update video
- `GET /studio/videos/delete/<id>/` - Delete confirmation
- `POST /studio/videos/delete/<id>/` - Delete video

### Thumbnail Generation
- `POST /studio/videos/thumbnail/<id>/` - Generate thumbnail

### Tag Management
- `GET /studio/videos/tags/` - Tag management
- `POST /studio/videos/tags/` - Create/edit tags

### Playlist Management
- `GET /studio/videos/playlists/` - Playlist management
- `POST /studio/videos/playlists/` - Create playlist
- `GET /studio/videos/playlists/<id>/` - Playlist detail
- `POST /studio/videos/playlists/<id>/` - Update playlist

## Configuration

### JSON Playlist Configuration
```json
{
  "autoplay": true,
  "loop": false,
  "shuffle": false,
  "crossfade": 2.0,
  "volume": 0.8
}
```

### Supported Video Formats
- MP4
- WebM
- AVI
- MOV
- MKV
- FLV

### File Size Limits
- Maximum file size: 500MB
- Recommended resolution: 1920x1080 or lower
- Recommended bitrate: 5-10 Mbps

## Keyboard Shortcuts

- `Ctrl/Cmd + A` - Select all videos
- `Ctrl/Cmd + F` - Focus search box
- `Ctrl/Cmd + Delete` - Batch delete selected videos
- `Space` - Play/pause video
- `Arrow Keys` - Navigate playlist

## Troubleshooting

### Common Issues

1. **FFmpeg not found**
   - Ensure FFmpeg is installed and in PATH
   - Check installation with `ffmpeg -version`

2. **Upload fails**
   - Check file size limits
   - Verify supported formats
   - Check storage permissions

3. **Thumbnail generation fails**
   - Verify FFmpeg installation
   - Check video file integrity
   - Ensure sufficient disk space

4. **Cloud storage upload fails**
   - Verify R2 credentials
   - Check network connectivity
   - Verify bucket permissions

### Performance Tips

1. **Large video files**
   - Use compressed formats (H.264, VP9)
   - Optimize bitrate for web delivery
   - Consider chunked uploads for very large files

2. **Multiple uploads**
   - Upload videos in batches
   - Use background processing for metadata extraction
   - Implement progress indicators

3. **Storage optimization**
   - Use CDN for video delivery
   - Implement video transcoding
   - Consider adaptive bitrate streaming

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is part of the From Abyss Dashboard and follows the same licensing terms.

## Support

For support and questions:
- Check the troubleshooting section
- Review the API documentation
- Contact the development team
