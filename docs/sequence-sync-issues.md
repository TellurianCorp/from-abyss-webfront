# PostgreSQL Sequence Synchronization Issues

## Problem Description

Django uses PostgreSQL sequences to generate primary key values for auto-incrementing fields. Sometimes these sequences can get out of sync with the actual data in the database, leading to `IntegrityError` exceptions like:

```
duplicate key value violates unique constraint "videos_videoplaylistitem_pkey"
DETAIL: Key (id)=(4) already exists.
```

## Root Causes

This typically happens when:

1. **Data imports**: Bulk data imports that don't update sequences
2. **Manual database operations**: Direct SQL inserts that bypass Django's ORM
3. **Database migrations**: Some migration operations can cause sequence desync
4. **Data restoration**: Restoring data from backups without updating sequences

## Solution

### Automatic Fix

Use the management command to fix sequence issues:

```bash
# Fix only VideoPlaylistItem sequences
python manage.py fix_sequences

# Check all video model sequences (dry run)
python manage.py fix_sequences --all-models --dry-run

# Fix all video model sequences
python manage.py fix_sequences --all-models
```

### Manual Fix

If you need to fix sequences manually:

```sql
-- Check current sequence value
SELECT last_value FROM videos_videoplaylistitem_id_seq;

-- Check max ID in table
SELECT MAX(id) FROM videos_videoplaylistitem;

-- Reset sequence to correct value
SELECT setval('videos_videoplaylistitem_id_seq', (SELECT MAX(id) FROM videos_videoplaylistitem));
```

## Prevention

1. **Always use Django ORM**: Avoid direct SQL inserts when possible
2. **Update sequences after bulk imports**: If you must do bulk imports, update sequences afterward
3. **Regular monitoring**: Run the fix command periodically to catch issues early
4. **Test after migrations**: Always test sequence sync after running migrations

## Detection

The issue manifests as:
- `IntegrityError` when creating new records
- Primary key constraint violations
- "duplicate key value" errors

If you see these errors, run the fix command immediately.
