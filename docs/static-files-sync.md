# Static Files Sync Documentation

This document explains how to sync your local static files with the remote Cloudflare R2 storage to ensure your local versions replace the outdated remote versions.

## Overview

The project includes management commands and scripts to force upload local static files to override remote versions. This is useful when your local files are more up-to-date than the remote ones.

## Available Commands

### 1. Force Upload Static Files Only

**Management Command:** `force_upload_static`
**Script:** `scripts/force_upload_static.sh`

Uploads only static files (CSS, JS, images, fonts, shaders) to override remote versions.

#### Usage Examples:

```bash
# Dry run to see what would be uploaded
./scripts/force_upload_static.sh --dry-run

# Upload all static files
./scripts/force_upload_static.sh

# Clear remote files first, then upload
./scripts/force_upload_static.sh --clear-remote

# Upload only specific file types
./scripts/force_upload_static.sh --file-types css js
```

### 2. Force Upload All Files

**Management Command:** `force_upload_all`
**Script:** `scripts/force_upload_all.sh`

Uploads both static and media files to override remote versions.

#### Usage Examples:

```bash
# Show help
./scripts/force_upload_all.sh --help

# Dry run to see what would be uploaded
./scripts/force_upload_all.sh --dry-run

# Upload all files
./scripts/force_upload_all.sh

# Upload only static files
./scripts/force_upload_all.sh --static-only

# Upload only media files
./scripts/force_upload_all.sh --media-only

# Clear remote files first, then upload
./scripts/force_upload_all.sh --clear-remote

# Upload only specific file types
./scripts/force_upload_all.sh --file-types css js img
```

## File Types Supported

- **css**: CSS files
- **js**: JavaScript files
- **img**: Images (PNG, JPG, JPEG, GIF, WebP, SVG, ICO)
- **fonts**: Font files (TTF, OTF, WOFF, WOFF2, EOT)
- **shaders**: Shader files (GLSL, VERT, FRAG)
- **videos**: Video files (MP4, AVI, MOV, WMV, FLV, WebM, MKV)
- **images**: Image files (PNG, JPG, JPEG, GIF, WebP, SVG, ICO, BMP, TIFF)
- **documents**: Document files (PDF, DOC, DOCX, TXT, MD, JSON, XML)

## Important Notes

1. **Production Only**: These commands should only be run in production environment (when `DEBUG=False`)

2. **Cache Control**: Files are uploaded with a 60-second cache for immediate updates. You may want to re-upload with longer cache after testing.

3. **Force Overwrite**: These commands force overwrite remote files with your local versions.

4. **Clear Remote Option**: Use `--clear-remote` to delete all existing files from remote before uploading. This ensures a clean slate.

## Typical Workflow

1. **Test with dry-run first:**
   ```bash
   ./scripts/force_upload_static.sh --dry-run
   ```

2. **Upload static files:**
   ```bash
   ./scripts/force_upload_static.sh --clear-remote
   ```

3. **Verify the upload:**
   - Check your website to ensure files are loading correctly
   - Verify file URLs are pointing to `https://media.fromabyss.com/static/`

4. **If needed, upload with longer cache:**
   ```bash
   # Edit the command to use longer cache time
   python manage.py force_upload_static --clear-remote
   ```

## Troubleshooting

### Common Issues

1. **Permission Errors**: Ensure the script is executable:
   ```bash
   chmod +x scripts/force_upload_static.sh
   chmod +x scripts/force_upload_all.sh
   ```

2. **Environment Issues**: Make sure you're in the correct directory and virtual environment is activated.

3. **S3 Connection Errors**: Verify your Cloudflare R2 credentials are correctly set in environment variables.

### Debug Mode

If you need to run in debug mode for testing, you can temporarily modify the commands to remove the DEBUG check, but remember to revert for production use.

## File Locations

After upload, your files will be available at:
- **Static files**: `https://media.fromabyss.com/static/`
- **Media files**: `https://media.fromabyss.com/`

## Related Commands

- `refresh_static`: Refresh static files and clear cache
- `upload_static_to_s3`: Upload static files to S3 with correct path structure
- `sync_storage`: Two-way synchronization with remote priority
- `storage_sync_ui`: Interactive UI for storage synchronization
