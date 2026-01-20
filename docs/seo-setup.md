# SEO Setup Documentation

This document describes the SEO optimization setup for From Abyss Media webfront.

## Overview

The project includes comprehensive SEO optimizations including:
- Meta tags (Open Graph, Twitter Cards)
- Sitemap.xml
- Robots.txt
- Structured data (JSON-LD)
- PWA manifest
- Dynamic SEO utilities

## Files

### Core SEO Files

1. **`index.html`** - Contains all primary meta tags, Open Graph tags, Twitter Cards, and structured data
2. **`public/sitemap.xml`** - XML sitemap for search engines
3. **`public/robots.txt`** - Instructions for search engine crawlers
4. **`public/manifest.json`** - PWA manifest for better mobile SEO

### SEO Utilities

1. **`src/utils/seo.ts`** - Core SEO utility functions
   - `updateSEO()` - Updates meta tags dynamically
   - `generateStructuredData()` - Creates JSON-LD structured data
   - `addStructuredData()` - Adds structured data to page

2. **`src/hooks/useSEO.ts`** - React hooks for SEO
   - `useSEO()` - Hook for managing page meta tags
   - `useStructuredData()` - Hook for adding structured data

## Usage

### Static SEO (index.html)

The main SEO tags are defined in `index.html` and apply to the homepage. These include:
- Primary meta tags (title, description, keywords)
- Open Graph tags for Facebook/LinkedIn sharing
- Twitter Card tags
- Structured data (JSON-LD) for WebSite and Organization

### Dynamic SEO in Components

When you need to update SEO tags for specific pages or components:

```tsx
import { useSEO } from '../hooks/useSEO'

function ArticlePage({ article }) {
  useSEO({
    title: `${article.title} - From Abyss Media`,
    description: article.excerpt,
    image: article.coverImage,
    url: `https://fromabyss.com/articles/${article.slug}`,
    type: 'article'
  })
  
  return <article>...</article>
}
```

### Adding Structured Data

For pages that need specific structured data (articles, reviews, etc.):

```tsx
import { useStructuredData } from '../hooks/useSEO'

function ReviewPage({ review }) {
  useStructuredData('Article', {
    headline: review.title,
    author: {
      '@type': 'Person',
      name: review.author
    },
    datePublished: review.publishedAt,
    image: review.coverImage,
    publisher: {
      '@type': 'Organization',
      name: 'From Abyss Media',
      logo: {
        '@type': 'ImageObject',
        url: 'https://fromabyss.com/imgs/logo.png'
      }
    }
  })
  
  return <article>...</article>
}
```

## Meta Tags Included

### Primary Tags
- `title` - Page title
- `description` - Page description
- `keywords` - SEO keywords
- `author` - Site author
- `robots` - Search engine directives
- `theme-color` - Browser theme color

### Open Graph (Facebook/LinkedIn)
- `og:type` - Content type
- `og:url` - Canonical URL
- `og:title` - Page title
- `og:description` - Page description
- `og:image` - Social sharing image
- `og:site_name` - Site name
- `og:locale` - Language locale

### Twitter Cards
- `twitter:card` - Card type (summary_large_image)
- `twitter:title` - Page title
- `twitter:description` - Page description
- `twitter:image` - Sharing image

### Structured Data (JSON-LD)
- WebSite schema
- Organization schema
- (Can be extended for Article, Review, Video, etc.)

## Sitemap

The sitemap (`public/sitemap.xml`) includes:
- Homepage
- Main sections (#tv, #platform, #editorial)
- Admin area (with lower priority)

**Note:** When adding new routes, update the sitemap accordingly.

## Robots.txt

The robots.txt file:
- Allows all crawlers to index the site
- Disallows `/admin/` from being indexed
- Points to the sitemap location
- Sets a crawl delay

## Best Practices

1. **Update sitemap** when adding new public pages
2. **Use dynamic SEO** for pages with unique content
3. **Keep images optimized** - Open Graph images should be 1200x630px
4. **Test with tools:**
   - [Google Rich Results Test](https://search.google.com/test/rich-results)
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [Google Search Console](https://search.google.com/search-console)

## URL Configuration

**Important:** Update the base URL (`https://fromabyss.com`) in:
- `index.html` (meta tags)
- `public/sitemap.xml`
- `src/utils/seo.ts` (defaultSEO object)
- `public/manifest.json`

When deploying to production, ensure all URLs point to the correct domain.

## Future Enhancements

Consider adding:
- Automatic sitemap generation from routes
- Dynamic structured data based on content type
- Multi-language support (hreflang tags)
- RSS feed for content
- Analytics integration (Google Analytics, etc.)


## Prerendered Route Shells

A post-build script generates route-specific HTML shells so social crawlers and search engines
can read page-level meta tags even when they do not execute JavaScript.

- Script: `scripts/prerender-routes.mjs`
- Trigger: `npm run build` (via `postbuild`)
- Output: `dist/<route>/index.html` for public routes

Update the `routes` list in the script when new public pages are added.
