# Loading Indicator Module

A reusable loading indicator module that can be used throughout the FromAbyss Dashboard application.

## Features

- **Full-screen overlay** loading indicator
- **Inline loading** for specific containers
- **AJAX integration** with automatic show/hide
- **Customizable** colors, sizes, and themes
- **jQuery plugin** for easy integration
- **Responsive** design
- **Accessibility** compliant

## Installation

### 1. Include the JavaScript and CSS files

```html
<!-- In your template -->
<script src="{% static 'js/loading-indicator.js' %}"></script>
<link rel="stylesheet" href="{% static 'css/loading-indicator.css' %}">
```

### 2. Initialize the module

```javascript
// Create default instance
window.loadingIndicator = new LoadingIndicator();

// Or with custom options
window.loadingIndicator = new LoadingIndicator({
    message: 'Custom loading message...',
    spinnerSize: '4rem',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    textColor: '#ffffff'
});
```

## Usage Examples

### Basic Usage

```javascript
// Show loading indicator
window.loadingIndicator.show('Loading data...');

// Hide loading indicator
window.loadingIndicator.hide();

// Show temporary loading (auto-hide after 2 seconds)
window.loadingIndicator.showTemporary('Processing...', 2000);
```

### Inline Loading for Specific Containers

```javascript
// Show loading in a specific container
const container = document.getElementById('myContainer');
window.loadingIndicator.showInline(container, 'Loading content...');

// Hide inline loading and restore original content
window.loadingIndicator.hideInline(container);
```

### jQuery Plugin Usage

```javascript
// Show loading in a jQuery element
$('#myContainer').loadingIndicator('show', 'Loading...');

// Hide loading
$('#myContainer').loadingIndicator('hide');
```

### AJAX Integration

The module automatically integrates with jQuery AJAX:

```javascript
// Loading indicator will automatically show/hide for AJAX requests
$.ajax({
    url: '/api/data/',
    success: function(data) {
        // Loading indicator automatically hidden
        console.log(data);
    }
});
```

### Manual AJAX Control

```javascript
// Show loading for custom AJAX
window.loadingIndicator.showForAjax('Fetching data...');

fetch('/api/data/')
    .then(response => response.json())
    .then(data => {
        window.loadingIndicator.hideForAjax();
        console.log(data);
    });
```

## Configuration Options

```javascript
const loadingIndicator = new LoadingIndicator({
    containerId: 'loadingIndicator',        // ID for the container element
    message: 'Loading...',                  // Default loading message
    spinnerSize: '3rem',                    // Size of the spinner
    backgroundColor: 'rgba(35, 39, 43, 0.8)', // Background color
    textColor: '#94a3b8',                   // Text color
    minHeight: '400px'                      // Minimum height for inline loading
});
```

## CSS Classes for Customization

### Size Variants
- `.loading-indicator-small` - Smaller spinner and text
- `.loading-indicator-large` - Larger spinner and text

### Color Variants
- `.loading-indicator-primary` - Blue spinner
- `.loading-indicator-success` - Green spinner
- `.loading-indicator-warning` - Yellow spinner
- `.loading-indicator-danger` - Red spinner

### Theme Variants
- `.loading-indicator-light` - Light theme
- `.loading-indicator-dark` - Dark theme

## Template Tag Usage

### Include the module

```html
{% load loading_indicator %}

<!-- Include JS and CSS -->
{% loading_indicator_js %}
{% loading_indicator_css %}

<!-- Initialize -->
{% loading_indicator_init %}
```

### Create containers

```html
<!-- Full-screen loading container -->
{% loading_indicator_container 'myLoadingIndicator' 'Loading data...' %}

<!-- Inline loading container -->
{% loading_indicator_inline 'myInlineLoading' 'Loading content...' %}
```

## Integration Examples

### Video Gallery Page

```javascript
// Show loading when page loads
$(document).ready(function() {
    const videoGrid = document.getElementById('videoGrid');
    if (videoGrid && window.loadingIndicator) {
        window.loadingIndicator.showInline(videoGrid, 'Loading video gallery...');
    }
    
    // Hide after page loads
    $(window).on('load', function() {
        if (videoGrid && window.loadingIndicator) {
            window.loadingIndicator.hideInline(videoGrid);
        }
    });
});
```

### Form Submission

```javascript
$('#myForm').on('submit', function(e) {
    e.preventDefault();
    
    // Show loading during form submission
    window.loadingIndicator.show('Submitting form...');
    
    $.ajax({
        url: '/submit/',
        data: $(this).serialize(),
        success: function(response) {
            window.loadingIndicator.hide();
            // Handle success
        },
        error: function() {
            window.loadingIndicator.hide();
            // Handle error
        }
    });
});
```

### Dynamic Content Loading

```javascript
function loadContent(containerId, url) {
    const container = document.getElementById(containerId);
    
    // Show loading in container
    window.loadingIndicator.showInline(container, 'Loading content...');
    
    fetch(url)
        .then(response => response.text())
        .then(html => {
            // Hide loading and update content
            window.loadingIndicator.hideInline(container);
            container.innerHTML = html;
        })
        .catch(error => {
            window.loadingIndicator.hideInline(container);
            console.error('Error loading content:', error);
        });
}
```

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Accessibility

The loading indicator includes:
- Screen reader support with `aria-hidden` attributes
- Proper focus management
- Keyboard navigation support
- High contrast mode compatibility
