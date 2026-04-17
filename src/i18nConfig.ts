import trEn from './lang/en/translation.json';
import trEs from './lang/es/translation.json';
import trFr from './lang/fr/translation.json';
import trZh from './lang/zh/translation.json';
import trPt from './lang/pt/translation.json';
import trRu from './lang/ru/translation.json';
import trAr from './lang/ar/translation.json';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'zh', 'pt', 'ru', 'ar'] as const;
export const RTL_LANGUAGES = ['ar'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'zh', label: '中文' },
  { value: 'pt', label: 'Português' },
  { value: 'ru', label: 'Русский' },
  { value: 'ar', label: 'العربية' },
];

export const resources = {
  en: {
    translation: trEn,
  },
  es: {
    translation: trEs,
  },
  fr: {
    translation: trFr,
  },
  zh: {
    translation: trZh,
  },
  pt: {
    translation: trPt,
  },
  ru: {
    translation: trRu,
  },
  ar: {
    translation: trAr,
  },
};

export const isSupportedLanguage = (language?: string): language is SupportedLanguage => (
  !!language && SUPPORTED_LANGUAGES.includes(language as SupportedLanguage)
);

export const getInitialLanguage = (preferredLanguage?: string, storedLanguage?: string) => {
  const normalizedPreferredLanguage = preferredLanguage?.toLowerCase();
  if (isSupportedLanguage(normalizedPreferredLanguage)) {
    return normalizedPreferredLanguage;
  }

  const normalizedStoredLanguage = storedLanguage?.toLowerCase();
  if (isSupportedLanguage(normalizedStoredLanguage)) {
    return normalizedStoredLanguage;
  }

  return 'en';
};

export const getLanguageDirection = (language: string) => (
  RTL_LANGUAGES.includes(language as typeof RTL_LANGUAGES[number]) ? 'rtl' : 'ltr'
);
