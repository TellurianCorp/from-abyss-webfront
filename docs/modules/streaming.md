# Streaming Templates Organization

This directory contains the streaming templates with a clean separation of concerns:

## Directory Structure

```
streaming/
├── css/                    # CSS files for styling
│   └── gametrailers.css   # Game Trailers show specific styles
├── js/                    # JavaScript files for functionality
│   ├── content-loader.js  # Content loading for main streaming page
│   ├── lowerthird.js      # Lower third overlay functionality
│   └── gametrailers.js    # Game Trailers show specific logic
├── shows/                 # Individual show templates
│   └── gametrailers/      # Game Trailers show
│       └── gametrailers.html
├── subtemplates/          # Reusable template components
├── _lowerthird.html       # Lower third overlay template
├── _shaderground.html     # Shader background template
├── _videoplayer.html      # Video player template
├── index.html             # Main streaming page
├── show_detail.html       # Show detail template
├── default_content.html   # Default content template
└── default_show.html      # Default show template
```

## File Organization Principles

- **HTML files**: Contain only markup structure
- **CSS files**: Contain only styling rules
- **JavaScript files**: Contain only functionality and behavior
- **No embedded styles or scripts**: All styling and behavior is externalized

## Usage

### Adding New Shows
1. Create HTML template in `shows/[show-name]/[show-name].html`
2. Create CSS file in `css/[show-name].css`
3. Create JavaScript file in `js/[show-name].js`
4. Link external files in the HTML template

### Reusable Components
- Use `_lowerthird.html` for consistent overlay displays
- Use `_shaderground.html` for shader backgrounds
- Use `_videoplayer.html` for video player functionality

## Benefits

- **Maintainability**: Easy to find and modify specific functionality
- **Reusability**: CSS and JS can be shared between templates
- **Performance**: Better caching and loading optimization
- **Debugging**: Easier to debug specific issues
- **Collaboration**: Multiple developers can work on different aspects simultaneously
