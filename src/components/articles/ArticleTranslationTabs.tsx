import './ArticleTranslationTabs.css'

interface ArticleTranslationTabsProps {
  languages: string[]
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  translations: Record<string, { complete: boolean }>
}

const languageLabels: Record<string, string> = {
  'pt-BR': 'Português (BR)',
  'en-GB': 'English (GB)',
}

export function ArticleTranslationTabs({
  languages,
  currentLanguage,
  onLanguageChange,
  translations,
}: ArticleTranslationTabsProps) {
  return (
    <div className="article-translation-tabs">
      {languages.map((lang) => {
        const isComplete = translations[lang]?.complete ?? false
        return (
          <button
            key={lang}
            className={`translation-tab ${currentLanguage === lang ? 'active' : ''} ${isComplete ? 'complete' : 'incomplete'}`}
            onClick={() => onLanguageChange(lang)}
            type="button"
          >
            {languageLabels[lang] || lang}
            {!isComplete && <span className="incomplete-indicator">●</span>}
          </button>
        )
      })}
    </div>
  )
}
