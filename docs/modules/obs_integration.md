# OBS Integration for From Abyss Dashboard

This module provides comprehensive OBS Studio integration for the From Abyss Publisher Dashboard, allowing you to control streaming, manage scenes, and configure streaming services directly from the web interface.

## Features

### 🎬 Stream Control
- **Start/Stop Transmission**: Control OBS streaming directly from the dashboard
- **Real-time Status**: Monitor streaming status with live updates
- **Multi-service Streaming**: Stream to multiple platforms simultaneously

### 🎭 Scene Management
- **Scene Switching**: Switch between OBS scenes with a single click
- **Scene Sync**: Automatically sync scenes from OBS Studio
- **Scene Thumbnails**: Visual scene management with thumbnails
- **Scene Organization**: Order and categorize scenes

### 📡 Streaming Services
- **Multiple Platforms**: Support for Twitch, YouTube, Facebook Gaming, and custom RTMP
- **Service Templates**: Quick setup for popular streaming platforms
- **Primary Service**: Set default streaming service
- **Stream Keys**: Secure management of streaming credentials

### 📊 Session Tracking
- **Stream History**: Track all streaming sessions
- **Duration Monitoring**: Monitor stream duration and performance
- **User Attribution**: Track who started each stream
- **Status Tracking**: Monitor stream status (idle, starting, live, stopping, error)

### 📝 Activity Logging
- **Operation Logs**: Complete audit trail of all OBS operations
- **Error Tracking**: Detailed error logging and reporting
- **User Actions**: Track user-initiated actions
- **System Events**: Monitor system-level OBS events

## Setup Instructions

### 1. OBS Studio Configuration

1. **Enable WebSocket Server**:
   - Open OBS Studio
   - Go to `Tools` → `WebSocket Server Settings`
   - Enable the WebSocket server
   - Set port to `4455` (default)
   - Enable authentication and set a secure password

2. **Verify Connection**:
   - Use the "Test Connection" button in the dashboard
   - Ensure OBS Studio is running and accessible

### 2. Dashboard Configuration

1. **Connection Settings**:
   - Navigate to `/studio/obs/connection/`
   - Configure OBS host (usually `localhost`)
   - Set port (default: `4455`)
   - Enter WebSocket password if authentication is enabled

2. **Streaming Services**:
   - Go to `/studio/obs/services/`
   - Add your streaming platforms (Twitch, YouTube, etc.)
   - Configure server URLs and stream keys
   - Set primary service for default streaming

3. **Scene Management**:
   - Visit `/studio/obs/scenes/`
   - Click "Sync from OBS" to import existing scenes
   - Add thumbnails and descriptions for better organization

## Usage

### Quick Stream Start
1. Go to the OBS Dashboard (`/studio/obs/`)
2. Enter stream title and description
3. Select streaming services
4. Click "Start Stream"

### Scene Switching
1. View available scenes in the dashboard
2. Click on any scene to switch to it
3. Visual indicators show the current active scene

### Service Management
1. Navigate to Streaming Services
2. Use quick setup templates for popular platforms
3. Configure custom RTMP servers as needed
4. Set primary service for default streaming

## API Endpoints

The integration provides RESTful API endpoints for programmatic control:

- `POST /studio/obs/api/test-connection/` - Test OBS connection
- `POST /studio/obs/api/sync-scenes/` - Sync scenes from OBS
- `POST /studio/obs/api/switch-scene/` - Switch to specific scene
- `POST /studio/obs/api/start-stream/` - Start streaming
- `POST /studio/obs/api/stop-stream/` - Stop streaming
- `GET /studio/obs/api/stream-status/` - Get current stream status

## Technical Details

### WebSocket Integration
- Uses OBS Studio's built-in WebSocket API (OBS 28+)
- Secure authentication with password protection
- Real-time bidirectional communication
- Automatic reconnection handling

### Database Models
- `OBSConnection`: Connection settings and status
- `OBSScene`: Scene configuration and metadata
- `StreamingService`: Platform configuration
- `StreamSession`: Session tracking and history
- `OBSLog`: Operation logging and audit trail

### Security
- Staff-only access (requires `@staff_member_required`)
- CSRF protection on all endpoints
- Secure password handling for WebSocket authentication
- Input validation and sanitization

## Troubleshooting

### Connection Issues
- Verify OBS Studio is running
- Check WebSocket server is enabled
- Confirm host/port settings
- Test with "Test Connection" button

### Scene Sync Problems
- Ensure scenes exist in OBS Studio
- Check WebSocket connection status
- Verify scene names match exactly
- Review operation logs for errors

### Streaming Issues
- Verify streaming service configuration
- Check stream keys are valid
- Ensure OBS output settings are correct
- Monitor logs for detailed error messages

## Dependencies

- `websockets==13.1` - WebSocket client for OBS communication
- Django 5.2+ - Web framework
- OBS Studio 28+ - Streaming software with WebSocket support

## Support

For issues or questions:
1. Check the operation logs in `/studio/obs/logs/`
2. Review Django logs for detailed error information
3. Verify OBS Studio WebSocket server configuration
4. Test connection using the built-in test functionality
