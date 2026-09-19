import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import ptBR from './locales/pt-BR'
import en from './locales/en'

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en'] as const
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number]

export const DEFAULT_LANGUAGE: SupportedLanguage = 'pt-BR'

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      'pt-BR': { translation: ptBR },
      en: { translation: en },
    },
    supportedLngs: [...SUPPORTED_LANGUAGES],
    // Regional variants ("pt", "en-US") resolve through the fallback chain.
    // Do not add nonExplicitSupportedLngs/load: with i18next 26 they make
    // "pt-BR" and "en-US" return raw keys.
    fallbackLng: DEFAULT_LANGUAGE,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    interpolation: {
      // React already escapes values against XSS.
      escapeValue: false,
    },
    react: {
      // Resources are bundled and initialised synchronously, so no Suspense
      // boundary is required.
      useSuspense: false,
    },
  })

export default i18n
