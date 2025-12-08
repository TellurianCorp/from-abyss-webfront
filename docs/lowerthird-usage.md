# Lowerthird Component Usage Guide

## Overview

The Lowerthird Component is a modular, themeable overlay system designed for streaming applications. It provides real-time clock display, animated text information, and game information display with multiple themes and effects.

## Quick Start

### 1. Include the Component

```html
{% include 'streaming/_lowerthird.html' %}
```

### 2. Basic Usage

```javascript
// Show information with default effect
window.showInfo('Welcome to From Abyss Media!');

// Show information with custom effect and duration
window.showInfo('Breaking news!', 'slide-in', 5000);

// Change theme
window.lowerthird.setTheme('neon');

// Show game information
window.lowerthird.showGameInfo('Cyberpunk 2077', 'RPG - CD Projekt Red');
```

## API Reference

### Global Functions

#### `showInfo(text, effect, duration)`
- **text** (string): Information to display
- **effect** (string, optional): Animation effect (default: 'fade-in')
- **duration** (number, optional): Display duration in milliseconds (default: 5000)

### Component Methods

#### `lowerthird.showInfo(text, effect, duration)`
Same as global function but accessed through component instance.

#### `lowerthird.hideInfo()`
Hides current information display.

#### `lowerthird.setTheme(theme)`
Changes the visual theme.
- **theme** (string): Theme name ('default', 'dark', 'light', 'neon')

#### `lowerthird.getTheme()`
Returns current theme name.

#### `lowerthird.cycleTheme()`
Cycles through available themes.

#### `lowerthird.showGameInfo(gameName, gameInfo)`
Shows game information section.
- **gameName** (string): Name of the game
- **gameInfo** (string, optional): Additional game information

#### `lowerthird.hideGameInfo()`
Hides game information section.

#### `lowerthird.getAvailableThemes()`
Returns array of available themes.

#### `lowerthird.getAvailableEffects()`
Returns array of available effects.

## Available Themes

- **default**: Dark background with white text and green accents
- **dark**: Darker theme with orange accents
- **light**: Light background with dark text and blue accents
- **neon**: Cyberpunk-style with cyan text and pink accents

## Available Effects

- **fade-in**: Smooth fade in animation
- **fade-out**: Smooth fade out animation
- **slide-in**: Slide in from left
- **slide-out**: Slide out to right
- **typewriter**: Typewriter effect
- **blink**: Blinking animation

## Keyboard Shortcuts

- **Ctrl/Cmd + I**: Show test information
- **Ctrl/Cmd + H**: Hide current information
- **Ctrl/Cmd + T**: Cycle through themes

## Hot Reload Features

### Development Mode
In development (localhost), the component automatically detects CSS changes and reloads styles without page refresh.

### Custom Events
You can trigger updates using custom events:

```javascript
// Change theme via event
document.dispatchEvent(new CustomEvent('lowerthird-update', {
    detail: { type: 'theme', data: 'neon' }
}));

// Show info via event
document.dispatchEvent(new CustomEvent('lowerthird-update', {
    detail: { 
        type: 'info', 
        data: { 
            text: 'Custom message', 
            effect: 'slide-in', 
            duration: 3000 
        } 
    }
}));

// Show game info via event
document.dispatchEvent(new CustomEvent('lowerthird-update', {
    detail: { 
        type: 'game', 
        data: { 
            name: 'Game Name', 
            info: 'Game Info' 
        } 
    }
}));
```

## Queue System

The component includes a queue system for handling multiple information requests:

```javascript
// Multiple calls will be queued
window.showInfo('First message', 'fade-in', 2000);
window.showInfo('Second message', 'slide-in', 2000);
window.showInfo('Third message', 'typewriter', 3000);
// Messages will display in sequence with 500ms gaps
```

## Responsive Design

The component automatically adapts to different screen sizes:
- Desktop: Full layout with all sections visible
- Tablet: Reduced font sizes and spacing
- Mobile: Compact layout with minimal spacing

## Customization

### Adding New Themes

1. Add theme CSS in `static/css/lowerthird.css`:
```css
.lowerthird-container[data-theme="custom"] {
    background: linear-gradient(135deg, your-colors);
    color: your-text-color;
}
```

2. Add theme to JavaScript:
```javascript
this.availableThemes = ['default', 'dark', 'light', 'neon', 'custom'];
```

### Adding New Effects

1. Add effect CSS in `static/css/lowerthird.css`:
```css
@keyframes customEffect {
    /* your animation */
}

.effect-custom-effect {
    animation: customEffect 1s ease-out;
}
```

2. Add effect to JavaScript:
```javascript
this.availableEffects = ['fade-in', 'slide-in', 'typewriter', 'blink', 'custom-effect'];
```

## Demo Page

Visit `/streaming/lowerthird-demo/` to see all features in action with interactive controls.

## File Structure

```
templates/streaming/
├── _lowerthird.html          # Main component template
└── lowerthird_demo.html      # Demo page

static/
├── css/
│   └── lowerthird.css        # Component styles
└── js/
    └── lowerthird.js         # Component logic
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Performance Notes

- Uses CSS transforms for hardware acceleration
- Optimized animations with reduced FPS for better performance
- Automatic cleanup of event listeners and intervals
- Minimal DOM manipulation for smooth operation
