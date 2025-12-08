# Storage Synchronization

This document describes the storage synchronization functionality for the FromAbyss Dashboard project.

## Overview

The storage system supports both one-way and two-way synchronization with Cloudflare R2 storage. The default behavior is two-way synchronization with remote priority in case of divergence.

## Commands

### Interactive Textual UI (Recommended)

```bash
python manage.py storage_sync_ui
```

Launches an interactive terminal-based UI built with [Textual](https://github.com/Textualize/textual) that provides:

- **Real-time progress tracking** with visual progress bars
- **File-by-file status updates** in a data table
- **Live sync statistics** (total files, synced, errors)
- **Interactive controls** for starting, stopping, and configuring sync
- **Real-time logging** with detailed error messages
- **Multiple sync modes** with dropdown selection
- **File scanning** and refresh capabilities

#### UI Features:

- **Progress Section**: Shows overall sync progress and current file being processed
- **Statistics Panel**: Displays total files, successfully synced files, and error count
- **File List**: Data table showing each file with action, size, status, and details
- **Log Section**: Real-time log output with sync events and errors
- **Controls**: Buttons for start/stop/refresh and sync mode selection

#### Usage:

1. Run the command to launch the UI
2. Select sync mode from the dropdown (Two-Way, Upload Only, Download Only)
3. Click "Start Sync" to begin synchronization
4. Monitor progress in real-time
5. Use "Stop" to interrupt the sync process
6. Click "Refresh" to rescan files
7. Use "Clear Log" to clear the log output

### Command Line Interface

#### Two-Way Sync (Default)

```bash
python manage.py update_storage
```

This performs two-way synchronization with remote priority. When files differ between local and remote, the remote version takes precedence.

#### Explicit Two-Way Sync

```bash
python manage.py update_storage --two-way
```

Same as the default behavior.

#### One-Way Upload

```bash
python manage.py update_storage --upload-only
```

Uploads only changed local files to remote storage (one-way sync).

#### One-Way Download

```bash
python manage.py update_storage --download-only
```

Downloads remote files to local storage (one-way sync).

#### Dedicated Two-Way Sync Command

```bash
python manage.py sync_storage
```

Dedicated command for two-way synchronization with remote priority.

## How Two-Way Sync Works

1. **Remote Priority**: When files differ between local and remote, the remote version is used
2. **New Files**: Files that exist only locally are uploaded, files that exist only remotely are downloaded
3. **Identical Files**: Files with matching MD5 hashes are skipped
4. **Divergence Resolution**: Uses MD5 hash comparison to detect differences

## File Types Synced

- **Static Files**: `staticfiles/` directory → `static/` prefix in R2
- **Media Files**: `media/` directory → `media/` prefix in R2

## Configuration

The system uses the following credentials from the database:

- `AWS_ACCESS_KEY_ID`: R2 access key
- `AWS_SECRET_ACCESS_KEY`: R2 secret key
- `AWS_S3_ENDPOINT_URL`: R2 endpoint URL
- `AWS_STORAGE_BUCKET_NAME`: R2 bucket name

## Logging

The sync process logs:
- Files being uploaded/downloaded
- Divergence detection and resolution
- Errors during sync operations

## Best Practices

1. **Use the Textual UI**: For the best user experience, use the interactive UI
2. **Backup**: Always backup important files before running sync
3. **Monitor**: Check logs for any sync errors
4. **Consistency**: Use the same sync mode across all environments
5. **Test**: Use dry-run mode when available to preview changes

## Error Handling

The system handles:
- Network connectivity issues
- Missing credentials
- File permission errors
- Invalid file paths

Errors are logged and the sync process continues with remaining files.

## Textual UI Controls

### Keyboard Shortcuts

- `Ctrl+C`: Exit the application
- `Tab`: Navigate between controls
- `Enter`: Activate buttons and select options
- `Space`: Toggle checkboxes

### Mouse Support

The Textual UI supports mouse interaction:
- Click buttons to activate them
- Click dropdowns to open selection menus
- Scroll through file lists and logs
- Click table headers to sort (if implemented)

## Troubleshooting

### Common Issues

1. **UI not starting**: Ensure Textual is installed (`pip install textual`)
2. **Sync not working**: Check R2 credentials in the database
3. **Files not found**: Ensure `staticfiles/` and `media/` directories exist
4. **Permission errors**: Check file permissions on local directories

### Getting Help

- Use the log section in the UI to see detailed error messages
- Check the Django logs for additional information
- Verify R2 bucket permissions and credentials
