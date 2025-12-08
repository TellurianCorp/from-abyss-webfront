# FromAbyss CSS Organization

## Overview

This directory contains the CSS files for the FromAbyss Dashboard project, organized according to best practices for maintainability and scalability.

## File Structure

### Core CSS Files

- **`fromabyss.css`** - Main CSS file containing:
  - CSS custom properties (variables)
  - Base styles and typography
  - Layout components
  - Navigation styles
  - Form elements
  - Utility classes
  - Font face declarations
  - Global animations and effects

- **`streaming.css`** - Streaming-specific CSS file containing:
  - Import of base resources from `fromabyss.css`
  - Lower third components
  - Shader ground components
  - Streaming layout components
  - Future streaming components (chat overlay, controls, etc.)

- **`indiecations.css`** - Indiecations-specific styles
- **`ckeditor-dark.css`** - CKEditor dark theme styles

## CSS Organization Guidelines

### 1. Separation of Concerns

- **Base styles** go in `fromabyss.css`
- **Component-specific styles** go in dedicated files (e.g., `streaming.css`)
- **Third-party integrations** have their own files (e.g., `ckeditor-dark.css`)

### 2. Import Strategy

Component CSS files should import base resources from `fromabyss.css`:

```css
/* Import base resources from fromabyss.css */
@import url('fromabyss.css');
```

This ensures:
- Access to CSS custom properties (variables)
- Consistent typography and spacing
- Shared utility classes
- Font face declarations

### 3. CSS Custom Properties

All color schemes, spacing, and design tokens are defined as CSS custom properties in `fromabyss.css`:

```css
:root {
  /* Color Scheme */
  --accent-primary: #cc1111;
  --bg-primary: #1a1a1d;
  
  /* Typography */
  --title-font: 'IM Fell English SC', serif;
  --body-font: 'Crimson Text', serif;
  
  /* Spacing */
  --border-radius-small: 4px;
  --border-radius-medium: 8px;
}
```

### 4. Component Structure

Each component CSS file should follow this structure:

```css
/* Component Name */
.component-name {
    /* Layout */
    position: relative;
    width: 100%;
    
    /* Visual */
    background: var(--bg-secondary);
    border: 1px solid var(--accent-primary);
    border-radius: var(--border-radius-medium);
    
    /* Typography */
    font-family: var(--body-font);
    color: var(--text-primary);
}

/* Component States */
.component-name:hover {
    /* Hover effects */
}

.component-name.loading {
    /* Loading state */
}

.component-name.error {
    /* Error state */
}

/* Responsive Design */
@media (max-width: 768px) {
    .component-name {
        /* Mobile styles */
    }
}
```

### 5. Naming Conventions

- Use kebab-case for class names: `.lowerthird-container`
- Use BEM methodology for complex components: `.lowerthird__content--active`
- Prefix utility classes: `.stream-control-btn`
- Use semantic names: `.clock-display`, `.floating-text`

### 6. Responsive Design

- Mobile-first approach
- Use CSS custom properties for breakpoints
- Test on multiple screen sizes
- Consider streaming-specific requirements (fullscreen, overlays)

### 7. Performance Considerations

- Minimize CSS specificity conflicts
- Use efficient selectors
- Group related styles together
- Consider critical CSS for above-the-fold content

## Streaming Components

### Lower Third

The lower third component includes:
- Clock display with timezone
- Animated text with glow effects
- Decorative corner accents
- Glitch and scan line effects
- Responsive design for different screen sizes

### Shader Ground

Shader ground components include:
- Debug selector for shader switching
- Three.js integration styles
- Fullscreen canvas styling

### Future Components

Planned components include:
- Chat overlay
- Stream controls
- Video player container
- Alert systems

## Maintenance

### Adding New Components

1. Create component-specific CSS file if needed
2. Import base resources from `fromabyss.css`
3. Follow naming conventions
4. Include responsive design
5. Document in this README

### Updating Existing Components

1. Maintain backward compatibility
2. Update documentation
3. Test across different screen sizes
4. Consider performance impact

### Best Practices

- Use CSS custom properties for consistency
- Keep components modular and reusable
- Test in streaming environment
- Consider accessibility requirements
- Document complex animations and effects
