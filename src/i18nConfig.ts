import trEn from './lang/en/translation.json';

export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'zh', 'pt', 'ru', 'ar'] as const;
export const RTL_LANGUAGES = ['ar'] as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_OPTIONS: Array<{ value: SupportedLanguage; label: string }> = [
  { value: 'en', label: 'EN' },
  { value: 'es', label: 'ES' },
  { value: 'fr', label: 'FR' },
  { value: 'zh', label: 'ZH' },
  { value: 'pt', label: 'PT' },
  { value: 'ru', label: 'RU' },
  { value: 'ar', label: 'AR' },
];

export const resources = {
  en: {
    translation: trEn,
  },
};

const translationLoaders = {
  en: () => Promise.resolve(trEn),
  es: () => import('./lang/es/translation.json').then((module) => module.default),
  fr: () => import('./lang/fr/translation.json').then((module) => module.default),
  zh: () => import('./lang/zh/translation.json').then((module) => module.default),
  pt: () => import('./lang/pt/translation.json').then((module) => module.default),
  ru: () => import('./lang/ru/translation.json').then((module) => module.default),
  ar: () => import('./lang/ar/translation.json').then((module) => module.default),
} satisfies Record<SupportedLanguage, () => Promise<Record<string, string>>>;

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

export const loadTranslationResources = async (language: SupportedLanguage) => (
  translationLoaders[language]()
);
