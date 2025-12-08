# Feed Import CLI Script

This directory contains a standalone CLI script for importing feeds from JSON files with real-time progress display and phase-based processing for large files.

## Scripts

### 1. `import_feeds_standalone.py` (Main Script)
A command-line tool that imports feed data from JSON files into the Django datasources Feed model with real-time progress tracking and automatic phase-based processing for large files.

### 2. `import_feeds_verbose.py` (Verbose Version)
Same functionality as the main script but with detailed database operation logging to show exactly when database insertions/updates occur.

## Features

- ✅ **Real-time progress display** with tqdm progress bars
- ✅ **Automatic file size detection** - splits large files (>2MB) into phases
- ✅ **Phase-based importing** for memory efficiency and better performance
- ✅ **Dry-run mode** to preview changes without making them
- ✅ **Feed validation** to check if URLs are accessible
- ✅ **Flexible JSON format** support
- ✅ **Error handling** with detailed error messages
- ✅ **Import statistics** with summary report
- ✅ **Circular import avoidance** - bypasses Django admin system
- ✅ **Configurable phase size** for custom batch processing

## Usage

### Basic Usage
```bash
# Basic import
python tools/import_feeds_standalone.py feeds.json

# Dry run (preview only)
python tools/import_feeds_standalone.py feeds.json --dry-run

# Import with validation
python tools/import_feeds_standalone.py feeds.json --validate

# Dry run with validation
python tools/import_feeds_standalone.py feeds.json --dry-run --validate
```

### Phase-Based Processing
```bash
# Custom phase size (default: 1000)
python tools/import_feeds_standalone.py feeds.json --phase-size 500

# Small phase size for testing
python tools/import_feeds_standalone.py feeds.json --phase-size 10
```

### Verbose Mode (Detailed Database Operations)
```bash
# Verbose mode with standard importing
python tools/import_feeds_verbose.py feeds.json --verbose

# Verbose mode with phase-based importing
python tools/import_feeds_verbose.py feeds.json --verbose --phase-size 5

# Verbose dry run
python tools/import_feeds_verbose.py feeds.json --dry-run --verbose
```

## Phase-Based Processing

The script automatically detects large JSON files (>2MB) and splits the import into phases for better performance:

### Automatic Detection
- **Files > 2MB**: Automatically uses phase-based processing
- **Files ≤ 2MB**: Uses standard single-pass processing
- **Manual override**: Use `--phase-size` to force phase-based processing

### Phase Benefits
- **Memory efficiency**: Processes feeds in smaller batches
- **Better error recovery**: If one phase fails, others can still succeed
- **Progress visibility**: Shows progress per phase
- **Memory cleanup**: Pauses between phases for garbage collection

### Example Phase Output
```
<i class="fas fa-ruler"></i> File size: 5.23 MB
<i class="fas fa-exclamation-triangle"></i>  Large file detected (>2MB). Will use phase-based importing.
   Phase size: 1000 feeds per phase

<i class="fas fa-sync-alt"></i> Phase-based importing: 3 phases of up to 1000 feeds each

<i class="fas fa-box"></i> Processing Phase 1/3
   Feeds 1-1000 of 2500
   Phase size: 1000 feeds
Phase 1: 100%|██████| 1000/1000 [02:30<00:00, 6.67feed/s]
   <i class="fas fa-check"></i> Phase 1 completed
   <i class="fas fa-chart-bar"></i> Phase stats: Created: 800, Updated: 200, Errors: 0
   <i class="fas fa-pause"></i> Pausing between phases...
```

## JSON Format

The script accepts JSON files in the following formats:

### Array of Feed Objects (Recommended)
```json
[
  {
    "title": "TechCrunch",
    "url": "https://techcrunch.com/feed/",
    "description": "Latest technology news and startup information",
    "feed_type": "rss",
    "health_status": "good",
    "tags": "technology, startups, news"
  },
  {
    "title": "Ars Technica",
    "url": "https://feeds.arstechnica.com/arstechnica/index",
    "description": "Technology news and analysis",
    "feed_type": "rss",
    "health_status": "good",
    "tags": "technology, science, analysis"
  }
]
```

### Object with 'feeds' Key
```json
{
  "feeds": [
    {
      "title": "Feed Title",
      "url": "https://example.com/feed.xml",
      "description": "Feed description",
      "feed_type": "rss",
      "health_status": "good",
      "tags": "news, technology"
    }
  ]
}
```

### Object with 'entries' Key
```json
{
  "entries": [
    {
      "title": "Feed Title",
      "url": "https://example.com/feed.xml",
      "description": "Feed description",
      "feed_type": "rss",
      "health_status": "good",
      "tags": "news, technology"
    }
  ]
}
```

## Field Descriptions

| Field | Required | Type | Description | Default |
|-------|----------|------|-------------|---------|
| `title` | No | String | Feed title | `"Feed {index}"` |
| `url` | **Yes** | String | Feed URL | - |
| `description` | No | String | Feed description | `""` |
| `feed_type` | No | String | Type: `rss`, `atom`, `json` | `"rss"` |
| `health_status` | No | String | Status: `good`, `unhealthy` | `"good"` |
| `tags` | No | String | Comma-separated tags | `""` |

## Command Line Options

- `json_file`: Path to the JSON file containing feed data
- `--dry-run`: Show what would be imported without making changes
- `--validate`: Validate feed URLs after import
- `--phase-size`: Number of feeds to process per phase (default: 1000)
- `--verbose`: Show detailed database operations (verbose version only)

## Example Output

### Standard Import
```
<i class="fas fa-folder"></i> Loading data from feeds.json...
<i class="fas fa-ruler"></i> File size: 0.00 MB
<i class="fas fa-check"></i> File size is manageable. Using standard importing.
<i class="fas fa-chart-bar"></i> Found 5 feed entries to process

<i class="fas fa-rocket"></i> Starting import process...
Importing feeds: 100%|██████| 5/5 [00:02<00:00, 2.25feed/s, <i class="fas fa-check"></i> Row 5: Created feed 'Engadget']

==================================================
<i class="fas fa-chart-line"></i> IMPORT SUMMARY
==================================================
Total entries processed: 5
<i class="fas fa-check"></i> Created: 5
<i class="fas fa-sync-alt"></i> Updated: 0
<i class="fas fa-forward"></i> Skipped: 0
<i class="fas fa-times"></i> Errors: 0
==================================================
```

### Phase-Based Import
```
<i class="fas fa-folder"></i> Loading data from large_feeds.json...
<i class="fas fa-ruler"></i> File size: 5.23 MB
<i class="fas fa-exclamation-triangle"></i>  Large file detected (>2MB). Will use phase-based importing.
   Phase size: 1000 feeds per phase
<i class="fas fa-chart-bar"></i> Found 2500 feed entries to process

<i class="fas fa-sync-alt"></i> Phase-based importing: 3 phases of up to 1000 feeds each

<i class="fas fa-box"></i> Processing Phase 1/3
   Feeds 1-1000 of 2500
   Phase size: 1000 feeds
Phase 1: 100%|██████| 1000/1000 [02:30<00:00, 6.67feed/s]
   <i class="fas fa-check"></i> Phase 1 completed
   <i class="fas fa-chart-bar"></i> Phase stats: Created: 800, Updated: 200, Errors: 0
   <i class="fas fa-pause"></i> Pausing between phases...

<i class="fas fa-box"></i> Processing Phase 2/3
   Feeds 1001-2000 of 2500
   Phase size: 1000 feeds
Phase 2: 100%|██████| 1000/1000 [02:25<00:00, 6.90feed/s]
   <i class="fas fa-check"></i> Phase 2 completed
   <i class="fas fa-chart-bar"></i> Phase stats: Created: 1600, Updated: 400, Errors: 0
   <i class="fas fa-pause"></i> Pausing between phases...

<i class="fas fa-box"></i> Processing Phase 3/3
   Feeds 2001-2500 of 2500
   Phase size: 500 feeds
Phase 3: 100%|██████| 500/500 [01:15<00:00, 6.67feed/s]
   <i class="fas fa-check"></i> Phase 3 completed
   <i class="fas fa-chart-bar"></i> Phase stats: Created: 2000, Updated: 500, Errors: 0

==================================================
<i class="fas fa-chart-line"></i> IMPORT SUMMARY
==================================================
Total entries processed: 2500
Phases completed: 3
<i class="fas fa-check"></i> Created: 2000
<i class="fas fa-sync-alt"></i> Updated: 500
<i class="fas fa-forward"></i> Skipped: 0
<i class="fas fa-times"></i> Errors: 0
==================================================
```

### Verbose Mode
```
<i class="fas fa-folder"></i> Loading data from feeds.json...
<i class="fas fa-ruler"></i> File size: 0.00 MB
<i class="fas fa-check"></i> File size is manageable. Using standard importing.
<i class="fas fa-chart-bar"></i> Found 5 feed entries to process
<i class="fas fa-search"></i> VERBOSE MODE - Showing detailed database operations

<i class="fas fa-rocket"></i> Starting standard import process...

--- Processing Feed 1/5 ---
[DEBUG] Processing feed 1/5
[DEBUG]   Title: TechCrunch
[DEBUG]   URL: https://techcrunch.com/feed/
[DEBUG]   Type: rss
[DEBUG]   Checking if feed exists in database...
[DEBUG]   Found existing feed: TechCrunch
[DEBUG]   <i class="fas fa-database"></i>  UPDATING DATABASE: Updating existing feed
[DEBUG]   <i class="fas fa-check"></i> DATABASE UPDATE COMPLETE
--- Completed Feed 1 ---

Importing feeds: 100%|██████| 5/5 [00:02<00:00, 2.18feed/s, <i class="fas fa-sync-alt"></i> Row 5: Updated feed 'Engadget']
```

## Sample Data

Sample JSON files are included in the project root:
- `sample_feeds.json` - 5 example feeds for testing
- `large_sample_feeds.json` - 15 example feeds for testing phase-based processing

## Troubleshooting

### Circular Import Errors
If you encounter circular import errors with other scripts, use `import_feeds_standalone.py` which bypasses Django's admin system.

### Permission Errors
Make sure the script is executable:
```bash
chmod +x tools/import_feeds_standalone.py
chmod +x tools/import_feeds_verbose.py
```

### File Not Found
Ensure the JSON file exists and the path is correct:
```bash
ls -la feeds.json
```

### Database Connection Issues
Make sure Django is properly configured and the database is accessible:
```bash
python manage.py check
```

### Memory Issues with Large Files
For very large files, reduce the phase size:
```bash
python tools/import_feeds_standalone.py large_feeds.json --phase-size 100
```

## Integration with Django Admin

The script works independently of Django's admin interface but imports data into the same Feed model used by the admin interface. You can view imported feeds in the Django admin at `/admin/datasources/feed/`.

## Performance Notes

- **Standard mode**: Processes all feeds in a single pass
- **Phase mode**: Processes feeds in configurable batches with memory cleanup
- **Progress delay**: 0.1s delay between feeds to make progress visible
- **Phase pause**: 1s pause between phases for memory cleanup
- **Validation**: Network timeout of 10 seconds for feed validation
- **Memory efficiency**: Phase-based processing reduces memory usage for large files

## Dependencies

- `django` - Django framework
- `tqdm` - Progress bars
- `requests` - HTTP requests for validation
- `datasources.models.Feed` - Feed model

All dependencies should already be installed in your Django project environment. 