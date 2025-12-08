# PostType Configuration Interface

## Overview

The PostType Configuration Interface allows you to manage different types of posts and their associated templates for social media platforms. This system provides a templating mechanism for creating consistent visual content across different social media platforms.

## Features

### 1. PostType Management
- **Title**: Descriptive name for the post type (e.g., "Horror Movie Review", "Game Trailer", "Behind the Scenes")
- **Description**: Brief explanation of the post type and its purpose
- **AI Prompt Style**: Instructions for AI content generation specific to this post type

### 2. Template System
Each PostType can have platform-specific templates:
- **Instagram**: 1080x1080 (square format)
- **Facebook**: 1200x630 (landscape format)
- **TikTok**: 1080x1920 (vertical format)
- **Mastodon**: 1080x1080 (square format)
- **Slasher**: 1080x1080 (square format)
- **Threads**: 1080x1080 (square format)

### 3. AI Integration
- AI prompts are combined with the general editorial style guide
- Provides context-specific instructions for content generation
- Supports different content styles per post type

## How to Use

### Accessing the Interface

1. Navigate to the Publisher Dashboard
2. Click on "PostTypes" button in the "Editorial Infos (All Posts)" section
3. Or directly visit `/studio/posttypes/`

### Creating a New PostType

1. **Fill in Basic Information**:
   - Title: Choose a descriptive name
   - Description: Explain the purpose and content style
   - AI Prompt Style: Provide specific instructions for AI content generation

2. **Upload Templates**:
   - Upload platform-specific template images
   - Templates should be PNG files with transparent backgrounds
   - Recommended sizes are shown for each platform

3. **Save**: Click "Create PostType" to save

### Editing Existing PostTypes

1. Click "Edit" on any PostType card
2. Modify fields as needed
3. Upload new templates to replace existing ones
4. Click "Save Changes"

### Template Design Guidelines

#### Template Structure
- **Background Layer**: The main image from the post
- **Template Overlay**: Your branded template with transparent areas
- **Text Areas**: Designated spaces for text content

#### Best Practices
- Use transparent PNG files
- Keep important content in the center (safe area)
- Consider platform-specific aspect ratios
- Test templates with various content types

### Example Use Cases

#### Horror Movie Review PostType
- **Title**: "Horror Movie Review"
- **Description**: "Reviews of horror films with analysis and ratings"
- **AI Prompt**: "Write engaging horror movie reviews that include plot summary, performance analysis, and scare factor rating. Use horror-specific terminology and maintain suspenseful tone."
- **Templates**: Dark, atmospheric designs with space for movie stills and text

#### Game Trailer PostType
- **Title**: "Game Trailer"
- **Description**: "Gaming content with trailer analysis and gameplay insights"
- **AI Prompt**: "Create gaming content that highlights key features, gameplay mechanics, and release information. Use gaming terminology and maintain excitement."
- **Templates**: Gaming-themed designs with space for screenshots and video thumbnails

#### Behind the Scenes PostType
- **Title**: "Behind the Scenes"
- **Description**: "Exclusive behind-the-scenes content and production insights"
- **AI Prompt**: "Write behind-the-scenes content that reveals production secrets, cast interviews, and making-of details. Keep tone casual and insider-focused."
- **Templates**: Documentary-style designs with space for production photos

## Technical Details

### Template Processing
Templates are processed using the `tools/photos.py` Photos class:
- Templates are overlaid on source images
- Automatic resizing to platform-specific dimensions
- Support for transparent overlays and text positioning

### File Storage
- Templates are stored in the `media/templates/` directory
- File naming follows the pattern: `cover_template_{platform}`
- Images are served through Django's media system

### Integration with Posts
- PostTypes are linked to Posts through the `type` field
- Templates are automatically applied when generating social media images
- AI prompts are used during content generation

## API Endpoints

- `GET /studio/posttypes/` - Main configuration interface
- `POST /studio/posttypes/` - Create new PostType
- `GET /studio/posttypes/edit/{id}/` - Edit existing PostType
- `POST /studio/posttypes/edit/{id}/` - Update PostType
- `GET /studio/posttypes/delete/{id}/` - Delete confirmation
- `POST /studio/posttypes/delete/{id}/` - Delete PostType
- `GET /studio/posttypes/{id}/preview/` - Generate template preview

## Future Enhancements

- Template preview with sample content
- Bulk template upload
- Template versioning
- Advanced AI prompt templates
- Template analytics and usage tracking
