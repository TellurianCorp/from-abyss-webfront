/**
 * SEO utility functions for managing meta tags dynamically
 */

export interface SEOData {
  title?: string
  description?: string
  keywords?: string
  image?: string
  url?: string
  type?: string
  siteName?: string
}

const defaultSEO: Required<SEOData> = {
  title: 'From Abyss Media - Horror Social Network, Reviews & Multimedia Platform',
  description: 'Immersive platform for horror fans & creators. Social networking, reviews, essays, and multimedia productions converging at the intersection of technology and dread.',
  keywords: 'horror, horror games, horror reviews, horror social network, horror community, horror essays, horror podcasts, horror videos, ActivityPub, federated social network, From Abyss Media, Tellurian',
  image: 'https://fromabyss.media/imgs/cover.png',
  url: 'https://fromabyss.media/',
  type: 'website',
  siteName: 'From Abyss Media',
}

/**
 * Updates meta tags in the document head
 */
export function updateSEO(data: SEOData): void {
  const seo = { ...defaultSEO, ...data }
  const baseUrl = 'https://fromabyss.media'

  // Primary meta tags
  if (seo.title) {
    document.title = seo.title
    updateMetaTag('title', seo.title)
  }
  updateMetaTag('description', seo.description)
  updateMetaTag('keywords', seo.keywords)

  // Open Graph tags
  updateMetaTag('og:title', seo.title, 'property')
  updateMetaTag('og:description', seo.description, 'property')
  updateMetaTag('og:image', seo.image, 'property')
  updateMetaTag('og:url', seo.url, 'property')
  updateMetaTag('og:type', seo.type, 'property')
  updateMetaTag('og:site_name', seo.siteName, 'property')

  // Twitter Card tags
  updateMetaTag('twitter:card', 'summary_large_image')
  updateMetaTag('twitter:title', seo.title)
  updateMetaTag('twitter:description', seo.description)
  updateMetaTag('twitter:image', seo.image)
  updateMetaTag('twitter:url', seo.url)

  // Canonical URL
  updateLinkTag('canonical', seo.url)
}

/**
 * Updates or creates a meta tag
 */
function updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
  if (!content) return

  let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement
  if (!element) {
    element = document.createElement('meta')
    element.setAttribute(attribute, name)
    document.head.appendChild(element)
  }
  element.setAttribute('content', content)
}

/**
 * Updates or creates a link tag
 */
function updateLinkTag(rel: string, href: string): void {
  if (!href) return

  let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement
  if (!element) {
    element = document.createElement('link')
    element.setAttribute('rel', rel)
    document.head.appendChild(element)
  }
  element.setAttribute('href', href)
}

/**
 * Generates structured data JSON-LD for a page
 */
export function generateStructuredData(type: 'WebSite' | 'Article' | 'Organization', data: Record<string, unknown>): string {
  const baseStructure = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  }

  return JSON.stringify(baseStructure)
}

/**
 * Adds structured data to the page
 */
export function addStructuredData(data: Record<string, unknown>, type: 'WebSite' | 'Article' | 'Organization' = 'WebSite'): void {
  const script = document.createElement('script')
  script.type = 'application/ld+json'
  script.textContent = generateStructuredData(type, data)
  document.head.appendChild(script)
}
