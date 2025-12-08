import { useTranslation } from 'react-i18next'
import './LanguageSelector.css'

export function LanguageSelector() {
  const { i18n } = useTranslation()

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng)
  }

  return (
    <div className="language-selector">
      <button
        className={`lang-btn ${i18n.language === 'pt-BR' ? 'active' : ''}`}
        onClick={() => changeLanguage('pt-BR')}
        aria-label="Português (Brasil)"
      >
        PT-BR
      </button>
      <button
        className={`lang-btn ${i18n.language === 'en-GB' ? 'active' : ''}`}
        onClick={() => changeLanguage('en-GB')}
        aria-label="English (British)"
      >
        EN-GB
      </button>
    </div>
  )
}
