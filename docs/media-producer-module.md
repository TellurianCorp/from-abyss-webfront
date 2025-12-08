# Media Producer Module

A comprehensive Django module for creating and managing podcast scripts and YouTube video scripts with AI assistance, character management, and multi-language support.

## Features

### 🎙️ Script Creation & Management
- **Intuitive Markdown Editor**: Rich text editing with support for sound effects, character assignments, and production notes
- **Character Management**: Create and manage characters/narrators with voice characteristics
- **Version Control**: Full revision system with change tracking and version history
- **Project Organization**: Organize scripts by type (podcast, YouTube, radio, etc.)

### 🤖 AI Integration
- **Grammar Check**: AI-powered grammar and spelling correction
- **Style Review**: Content style and flow optimization suggestions
- **Format Check**: Script formatting and structure validation
- **Duration Optimization**: AI suggestions for pacing and length adjustments
- **Translation Assistance**: AI-powered translation support

### 🌍 Multi-Language Support
- **Translation Management**: Support for 12+ languages including English, Spanish, Portuguese, French, German, Italian, Russian, Japanese, Korean, Chinese, Arabic, and Hindi
- **Translation Workflow**: Approval system for translated content
- **Language-Specific Formatting**: ISO format support for different countries and industries

### 🎵 Audio & Music Integration
- **Background Music**: Integration with multiple music services (SUNO AI, Spotify, YouTube Music, Freesound)
- **Sound Effects**: Built-in sound effect library with easy insertion
- **Audio Recording**: Per-dialog audio recording support
- **Music Management**: Upload and organize background music tracks

### ⏱️ Duration & Timing
- **Automatic Duration Calculation**: AI-powered estimation based on text length and reading speed
- **Timing Optimization**: Suggestions for pacing adjustments
- **Duration Tracking**: Real-time duration updates as you edit

### 📊 Preview & Export
- **Multiple Export Formats**: PDF, Word, HTML, JSON, XML
- **Live Preview**: Real-time script preview with formatting
- **Print-Friendly**: Optimized layouts for printing and sharing

## Technical Architecture

### Models

#### Core Models
- **ScriptProject**: Main project container with metadata
- **ScriptVersion**: Version control with change tracking
- **ScriptBlock**: Individual script segments with character assignments
- **Character**: Character/narrator management with voice characteristics

#### Supporting Models
- **ScriptTranslation**: Multi-language content management
- **BackgroundMusic**: Music track management and integration
- **AIReview**: AI assistance and suggestion tracking
- **ScriptPreview**: Export and preview functionality
- **ISOFormat**: Industry-standard format support

### Views & URLs

#### Main Views
- `dashboard`: Main media producer dashboard
- `project_list`: List and filter script projects
- `project_detail`: Detailed project view with blocks and metadata
- `script_editor`: Main script editing interface

#### API Endpoints
- `create_script_block`: AJAX endpoint for creating script blocks
- `update_script_block`: AJAX endpoint for updating blocks
- `delete_script_block`: AJAX endpoint for deleting blocks
- `ai_assist`: AI assistance and review endpoints
- `preview_script`: Script preview in multiple formats

#### Management Views
- `character_management`: Character creation and management
- `music_management`: Background music management
- `translation_management`: Translation workflow management

### Frontend Features

#### Script Editor
- **Drag & Drop**: Reorder script blocks with drag and drop
- **Real-time Editing**: Live content editing with auto-save
- **Character Selection**: Easy character assignment
- **Sound Effects**: Quick sound effect insertion
- **Background Music**: Music track assignment and management

#### AI Integration
- **Grammar Check**: Real-time grammar and spelling correction
- **Style Review**: Content flow and engagement optimization
- **Format Validation**: Script structure and formatting checks
- **Duration Analysis**: Pacing and length optimization

#### Responsive Design
- **Mobile-Friendly**: Optimized for tablet and mobile editing
- **Dark Theme**: Professional dark theme for content creation
- **Accessibility**: WCAG compliant interface design

## Usage

### Creating a New Script Project

1. **Navigate to Media Producer**: Access the media producer dashboard
2. **Create Project**: Click "Create Project" and select project type
3. **Add Characters**: Create characters/narrators for your script
4. **Start Writing**: Use the intuitive script editor to create content
5. **Add Sound Effects**: Insert sound effects and background music
6. **AI Review**: Use AI assistance for grammar, style, and format checking
7. **Preview & Export**: Preview your script and export in various formats

### Character Management

1. **Create Characters**: Define characters with voice characteristics
2. **Assign Roles**: Assign characters to script blocks
3. **Voice Notes**: Add voice characteristics and production notes
4. **Character Library**: Build a reusable character library

### Translation Workflow

1. **Create Translation**: Select target language for translation
2. **AI Translation**: Use AI assistance for initial translation
3. **Human Review**: Manual review and editing of translations
4. **Approval Process**: Approve final translations for production

### Music Integration

1. **Upload Music**: Upload background music tracks
2. **External Services**: Integrate with SUNO AI, Spotify, etc.
3. **Music Assignment**: Assign music to specific script blocks
4. **Volume Control**: Set volume levels and fade effects

## Configuration

### OpenAI Integration
The module uses the existing OpenAI integration from the credentials module. Ensure you have:
- Active OpenAI credentials in the database
- Proper API key configuration
- Sufficient API quota for AI assistance

### File Storage
Media files are stored using the project's existing storage configuration:
- Local storage for development
- Cloudflare R2 for production
- Automatic file organization by type

### Database
The module creates the following database tables:
- `media_producer_scriptproject`
- `media_producer_scriptversion`
- `media_producer_scriptblock`
- `media_producer_character`
- `media_producer_scripttranslation`
- `media_producer_backgroundmusic`
- `media_producer_aireview`
- `media_producer_scriptpreview`
- `media_producer_isoformat`
- `media_producer_scriptblockmusic`

## API Reference

### Script Block Management
```javascript
// Create a new script block
POST /media-producer/projects/{project_id}/blocks/create/
{
    "block_type": "dialogue",
    "character_id": 1,
    "content": "Hello, welcome to our podcast!",
    "sound_effect": "door-slam",
    "background_music": "intro-music"
}

// Update a script block
POST /media-producer/blocks/{block_id}/update/
{
    "content": "Updated content",
    "character_id": 2
}

// Delete a script block
DELETE /media-producer/blocks/{block_id}/delete/
```

### AI Assistance
```javascript
// Get AI assistance
GET /media-producer/projects/{project_id}/ai-assist/?type=grammar
GET /media-producer/projects/{project_id}/ai-assist/?type=style
GET /media-producer/projects/{project_id}/ai-assist/?type=format
GET /media-producer/projects/{project_id}/ai-assist/?type=duration
```

### Preview & Export
```javascript
// Preview script in different formats
GET /media-producer/projects/{project_id}/preview/?format=html
GET /media-producer/projects/{project_id}/preview/?format=markdown
GET /media-producer/projects/{project_id}/preview/?format=json
```

## Customization

### Adding New Block Types
Extend the `BLOCK_TYPE_CHOICES` in the `ScriptBlock` model:

```python
BLOCK_TYPE_CHOICES = [
    ('dialogue', 'Dialogue'),
    ('narration', 'Narration'),
    ('sound_effect', 'Sound Effect'),
    ('music', 'Music'),
    ('pause', 'Pause'),
    ('action', 'Action'),
    ('transition', 'Transition'),
    ('custom_type', 'Custom Type'),  # Add your custom type
]
```

### Adding New Languages
Extend the `LANGUAGE_CHOICES` in the `ScriptTranslation` model:

```python
LANGUAGE_CHOICES = [
    ('en', 'English'),
    ('es', 'Spanish'),
    # ... existing languages ...
    ('new_lang', 'New Language'),  # Add your language
]
```

### Custom AI Prompts
Modify the AI assistance prompts in the `ai_assist` view to customize AI behavior for your specific use case.

## Troubleshooting

### Common Issues

1. **AI Assistance Not Working**
   - Check OpenAI credentials in the database
   - Verify API key is active and has sufficient quota
   - Check network connectivity

2. **File Upload Issues**
   - Verify storage configuration
   - Check file permissions
   - Ensure sufficient storage space

3. **Translation Issues**
   - Verify language codes are correct
   - Check translation service connectivity
   - Review translation approval workflow

### Performance Optimization

1. **Database Queries**
   - Use `select_related()` for foreign key relationships
   - Implement pagination for large script lists
   - Cache frequently accessed data

2. **File Storage**
   - Use CDN for media files
   - Implement file compression
   - Optimize image and audio file sizes

3. **AI Integration**
   - Implement request queuing for AI calls
   - Cache AI responses when appropriate
   - Use appropriate model sizes for different tasks

## Future Enhancements

### Planned Features
- **Voice Synthesis**: Integration with text-to-speech services
- **Video Integration**: YouTube video script optimization
- **Collaboration**: Multi-user editing and review
- **Analytics**: Script performance and engagement metrics
- **Templates**: Pre-built script templates for different formats
- **Automation**: Automated script generation from outlines

### Integration Opportunities
- **OBS Integration**: Direct integration with OBS Studio
- **Streaming Platforms**: YouTube, Twitch, and other platform optimization
- **Social Media**: Automatic social media content generation
- **Analytics**: Integration with analytics platforms for performance tracking

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the Django logs for error messages
3. Verify all dependencies are properly installed
4. Check database migrations are applied correctly

## License

This module is part of the From Abyss Dashboard project and follows the same licensing terms.
