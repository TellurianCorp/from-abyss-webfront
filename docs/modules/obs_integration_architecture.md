# OBS Manager Architecture

## Overview

The OBS Manager has been reorganized to implement a callback-based architecture instead of polling. This provides real-time status updates and better performance.

## Architecture Components

### 1. OBS Manager (`obs_manager.py`)
- **Purpose**: Central service that runs continuously in the background
- **Features**:
  - Singleton pattern for global access
  - Continuous monitoring of OBS status
  - Callback system for status updates
  - Automatic database synchronization
  - External callback endpoint notifications

### 2. Connection Manager (`connection_manager.py`)
- **Purpose**: Handles WebSocket connection to OBS Studio
- **Features**:
  - Persistent WebSocket connection
  - Event handling for OBS events
  - Automatic reconnection
  - Heartbeat mechanism

### 3. Callback Views (`callback_views.py`)
- **Purpose**: Provides endpoints for OBS Manager to update status
- **Endpoints**:
  - `/api/callback/scene-change/` - Scene change notifications
  - `/api/callback/streaming-change/` - Streaming status changes
  - `/api/callback/connection-change/` - Connection status changes

### 4. Updated Views (`views.py`)
- **Purpose**: Interface endpoints that request info from OBS Manager
- **Changes**:
  - No more polling for status updates
  - Direct requests to OBS Manager
  - Real-time status from manager

## How It Works

### 1. Startup Process
1. OBS Manager starts in background thread
2. Connection Manager establishes WebSocket connection to OBS
3. Initial status sync from OBS
4. Continuous monitoring begins

### 2. Status Monitoring
1. OBS Manager polls OBS every 5 seconds for status changes
2. When changes detected, callbacks are triggered
3. Database is updated automatically
4. External endpoints are notified via HTTP callbacks

### 3. Event Handling
1. OBS sends events via WebSocket (scene changes, streaming status, etc.)
2. Connection Manager receives and processes events
3. Events are forwarded to OBS Manager
4. OBS Manager updates internal state and triggers callbacks

### 4. Interface Requests
1. Web interface requests status from OBS Manager
2. OBS Manager returns current cached status
3. No direct polling of OBS from interface
4. Real-time updates via callbacks

## Benefits

### Performance
- **No Polling**: Interface doesn't poll OBS directly
- **Cached Status**: Fast responses from cached data
- **Efficient Updates**: Only updates when changes occur

### Reliability
- **Persistent Connection**: Maintains connection to OBS
- **Automatic Reconnection**: Handles connection drops
- **Error Handling**: Comprehensive error management

### Real-time Updates
- **Event-driven**: Responds to OBS events immediately
- **Callback System**: Notifies interested parties of changes
- **Database Sync**: Automatic database updates

## API Endpoints

### OBS Manager Control
- `POST /api/obs-manager/start/` - Start OBS Manager
- `POST /api/obs-manager/stop/` - Stop OBS Manager
- `GET /api/obs-manager/status/` - Get manager status

### OBS Operations
- `POST /api/test-connection/` - Test OBS connection
- `POST /api/sync-scenes/` - Sync scenes from OBS
- `POST /api/switch-scene/` - Switch to specific scene
- `POST /api/start-stream/` - Start streaming
- `POST /api/stop-stream/` - Stop streaming
- `GET /api/stream-status/` - Get current status

### Callback Endpoints
- `POST /api/callback/scene-change/` - Scene change callback
- `POST /api/callback/streaming-change/` - Streaming status callback
- `POST /api/callback/connection-change/` - Connection status callback

## Usage

### Starting the Manager
```bash
# Via management command
python manage.py start_obs_manager --daemon

# Via API
curl -X POST /studio/obs/api/obs-manager/start/
```

### Getting Status
```python
from obs_integration.obs_manager import obs_manager_instance

status = obs_manager_instance.get_current_status()
print(f"Connected: {status['connected']}")
print(f"Current Scene: {status['current_scene']}")
print(f"Streaming: {status['is_streaming']}")
```

### Registering Callbacks
```python
def my_scene_callback(scene_name):
    print(f"Scene changed to: {scene_name}")

obs_manager_instance.register_scene_callback(my_scene_callback)
```

## Configuration

### Settings
```python
# settings.py
OBS_CALLBACK_BASE_URL = 'http://localhost:8000'  # Base URL for callbacks
OBS_WEBSOCKET_HOST = '127.0.0.1'  # OBS WebSocket host
OBS_WEBSOCKET_PORT = 4455  # OBS WebSocket port
OBS_WEBSOCKET_PASSWORD = 'your_password'  # OBS WebSocket password
```

## Testing

Run the test script to verify the architecture:
```bash
python obs_integration/test_obs_manager.py
```

## Migration from Old Architecture

The old polling-based system has been replaced. Key changes:

1. **No More Direct OBS Polling**: Interface requests go through OBS Manager
2. **Real-time Updates**: Status changes are pushed via callbacks
3. **Persistent Connection**: OBS Manager maintains connection to OBS
4. **Better Performance**: Cached status with efficient updates

## Troubleshooting

### Manager Not Starting
- Check OBS Studio is running
- Verify WebSocket server is enabled
- Check connection settings

### No Status Updates
- Ensure OBS Manager is running
- Check callback endpoints are accessible
- Verify OBS events are being received

### Connection Issues
- Check OBS WebSocket settings
- Verify host/port configuration
- Check authentication settings
