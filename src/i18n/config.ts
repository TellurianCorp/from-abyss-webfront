import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

import ptBR from '../locales/pt-BR/translation.json'
import enGB from '../locales/en-GB/translation.json'

const resources = {
  'pt-BR': {
    translation: ptBR,
  },
  'en-GB': {
    translation: enGB,
  },
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en-GB',
    supportedLngs: ['pt-BR', 'en-GB'],
    defaultNS: 'translation',
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18n
