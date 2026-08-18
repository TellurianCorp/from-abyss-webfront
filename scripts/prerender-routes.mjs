import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.resolve(scriptDir, '../dist')
const baseHtmlPath = path.join(distDir, 'index.html')

if (!existsSync(baseHtmlPath)) {
  console.error('Missing dist/index.html. Run the build before prerendering.')
  process.exit(1)
}

const baseHtml = readFileSync(baseHtmlPath, 'utf8')
const baseUrl = 'https://fromabyss.com'
const siteName = 'From Abyss Media'
const defaultImage = `${baseUrl}/imgs/cover.png`

const routes = [
  {
    path: '/',
    title: 'From Abyss Media - Horror Social Network, Reviews & Multimedia Platform',
    description: 'Immersive platform for horror fans & creators. Social networking, reviews, essays, and multimedia productions converging at the intersection of technology and dread.',
  },
  {
    path: '/about',
    title: 'About - From Abyss Media',
    description: 'Learn about From Abyss Media, the horror community platform for creators and fans.',
  },
  {
    path: '/contact',
    title: 'Contact - From Abyss Media',
    description: 'Get in touch with the From Abyss Media team for partnerships, support, and media inquiries.',
  },
  {
    path: '/editorial',
    title: 'Editorial - From Abyss Media',
    description: 'Editorial hub for horror essays, reviews, interviews, and multimedia storytelling.',
  },
  {
    path: '/patreon',
    title: 'Support - From Abyss Media',
    description: 'Support From Abyss Media on Patreon and help build the future of horror media.',
  },
  {
    path: '/roadmap',
    title: 'Roadmap - From Abyss Media',
    description: 'Product roadmap for From Abyss Media and related projects across the ecosystem.',
  },
  {
    path: '/microblog',
    title: 'Microblog - From Abyss Media',
    description: 'Federated microblog feed for the From Abyss Media community.',
  },
  {
    path: '/articles',
    title: 'Articles - From Abyss Media',
    description: 'News, reviews, opinion and essays on horror across games, film, books and music.',
  },
]

// The seeded article types, duplicated from
// from-abyss-api/migrations/017_create_article_types.up.sql.
//
// The duplication is real and does not go away. `make migrate-up` runs psql -f,
// which cannot read a shared JSON file, and this script must not call the API:
// it runs during the Railway build, and a postbuild step failing because the
// API is briefly unavailable would take down a whole deploy for a cosmetic gain.
//
// A type created later through the admin screen gets the SPA shell plus client
// side useSEO, which is exactly what every article page already gets today, so
// it is not a regression -- only a missed optimisation for the eleven that ship
// with the product. Editing this list is optional; leaving it stale costs
// nothing beyond that.
const articleTypes = [
  { slug: 'news', name: 'News', description: 'Horror news: announcements, releases and what just happened.' },
  { slug: 'review', name: 'Reviews', description: 'Reviews of horror games, films, books, comics and music.' },
  { slug: 'opinion', name: 'Opinion', description: 'Opinion pieces and arguments about horror and its culture.' },
  { slug: 'interview', name: 'Interviews', description: 'Conversations with the people who make horror.' },
  { slug: 'feature', name: 'Features', description: 'Long-form features and reported pieces on horror.' },
  { slug: 'editorial', name: 'Editorials', description: 'Editorials from From Abyss Media.' },
  { slug: 'essay', name: 'Essays', description: 'Critical essays on horror as a form.' },
  { slug: 'list', name: 'Lists', description: 'Ranked and curated lists across horror media.' },
  { slug: 'retrospective', name: 'Retrospectives', description: 'Looking back at the horror that shaped the genre.' },
  { slug: 'guide', name: 'Guides', description: 'Practical guides and how-tos for horror fans and creators.' },
  { slug: 'report', name: 'Reports', description: 'Reports from events, festivals and the horror industry.' },
]

for (const articleType of articleTypes) {
  routes.push({
    path: `/articles/type/${articleType.slug}`,
    title: `${articleType.name} - From Abyss Media`,
    description: articleType.description,
  })
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function replaceOrInsertMeta(html, attr, name, content) {
  const escaped = escapeHtml(content)
  const tag = `<meta ${attr}="${name}" content="${escaped}" />`
  const regex = new RegExp(`<meta\\s+${attr}="${escapeRegExp(name)}"[^>]*>`, 'i')
  if (regex.test(html)) {
    return html.replace(regex, tag)
  }
  return html.replace('</head>', `  ${tag}
</head>`)
}

function replaceOrInsertLink(html, rel, href) {
  const escaped = escapeHtml(href)
  const tag = `<link rel="${rel}" href="${escaped}" />`
  const regex = new RegExp(`<link\\s+rel="${escapeRegExp(rel)}"[^>]*>`, 'i')
  if (regex.test(html)) {
    return html.replace(regex, tag)
  }
  return html.replace('</head>', `  ${tag}
</head>`)
}

function replaceTitle(html, title) {
  const escaped = escapeHtml(title)
  if (/<title>.*<\/title>/i.test(html)) {
    return html.replace(/<title>.*<\/title>/i, `<title>${escaped}</title>`)
  }
  return html.replace('</head>', `  <title>${escaped}</title>
</head>`)
}

function buildRouteHtml(route) {
  const url = `${baseUrl}${route.path}`
  let html = baseHtml
  html = replaceTitle(html, route.title)
  html = replaceOrInsertMeta(html, 'name', 'title', route.title)
  html = replaceOrInsertMeta(html, 'name', 'description', route.description)
  html = replaceOrInsertMeta(html, 'property', 'og:title', route.title)
  html = replaceOrInsertMeta(html, 'property', 'og:description', route.description)
  html = replaceOrInsertMeta(html, 'property', 'og:image', defaultImage)
  html = replaceOrInsertMeta(html, 'property', 'og:url', url)
  html = replaceOrInsertMeta(html, 'property', 'og:type', 'website')
  html = replaceOrInsertMeta(html, 'property', 'og:site_name', siteName)
  html = replaceOrInsertMeta(html, 'name', 'twitter:card', 'summary_large_image')
  html = replaceOrInsertMeta(html, 'name', 'twitter:title', route.title)
  html = replaceOrInsertMeta(html, 'name', 'twitter:description', route.description)
  html = replaceOrInsertMeta(html, 'name', 'twitter:image', defaultImage)
  html = replaceOrInsertMeta(html, 'name', 'twitter:url', url)
  html = replaceOrInsertLink(html, 'canonical', url)
  return html
}

for (const route of routes) {
  const html = buildRouteHtml(route)
  const targetDir = route.path === '/' ? distDir : path.join(distDir, route.path.replace(/^\//, ''))
  mkdirSync(targetDir, { recursive: true })
  writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8')
}
