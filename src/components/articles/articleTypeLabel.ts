import type { ArticleType, LocalizedText } from '../../services/articleTypeService'

/**
 * The one place an article type turns into text a reader sees.
 *
 * There is deliberately no locale key for any type name, not even for the
 * eleven seeded ones. The admin screen makes these labels editable, and a
 * locale key would silently win over the field an admin just edited -- they
 * would rename "Review" to "Crítica de cinema", save, and watch nothing change
 * anywhere on the site. Making the vocabulary administrable and then overriding
 * it in the frontend would make that administration a lie.
 *
 * The chain is: requested language, then pt-BR, then the slug. The last step
 * matters more than it looks -- a badge must never render empty, and a type
 * created through the admin screen with one language momentarily missing still
 * has to show something.
 */
export function localizedLabel(
  text: LocalizedText | undefined,
  language: string,
  fallback: string,
): string {
  if (!text) return fallback

  const requested = text[language]
  if (requested && requested.trim()) return requested

  const portuguese = text['pt-BR']
  if (portuguese && portuguese.trim()) return portuguese

  return fallback
}

/** The type's name in the given language. Falls back to its slug. */
export function articleTypeLabel(articleType: ArticleType, language: string): string {
  return localizedLabel(articleType.name, language, articleType.slug)
}

/** The type's description, or an empty string when it has none. */
export function articleTypeDescription(articleType: ArticleType, language: string): string {
  return localizedLabel(articleType.description, language, '')
}
