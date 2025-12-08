import { useEffect } from 'react'
import { updateSEO, addStructuredData, type SEOData } from '../utils/seo'

/**
 * React hook for managing SEO meta tags
 * 
 * @example
 * ```tsx
 * function MyPage() {
 *   useSEO({
 *     title: 'My Page Title',
 *     description: 'Page description',
 *     image: '/imgs/my-image.png'
 *   })
 *   return <div>...</div>
 * }
 * ```
 */
export function useSEO(data: SEOData): void {
  useEffect(() => {
    updateSEO(data)
  }, [data])
}

/**
 * React hook for adding structured data (JSON-LD)
 * 
 * @example
 * ```tsx
 * function ArticlePage({ article }) {
 *   useStructuredData('Article', {
 *     headline: article.title,
 *     author: { '@type': 'Person', name: article.author },
 *     datePublished: article.publishedAt
 *   })
 *   return <article>...</article>
 * }
 * ```
 */
export function useStructuredData(
  type: 'WebSite' | 'Article' | 'Organization',
  data: Record<string, unknown>
): void {
  const dataString = JSON.stringify(data)
  
  useEffect(() => {
    addStructuredData(data, type)
    
    // Cleanup: remove the script when component unmounts
    return () => {
      const scripts = document.querySelectorAll('script[type="application/ld+json"]')
      scripts.forEach((script) => {
        const content = script.textContent
        if (content && JSON.parse(content)['@type'] === type) {
          script.remove()
        }
      })
    }
  }, [type, dataString])
}
