import {
  getInitialLanguage,
  getLanguageDirection,
  LANGUAGE_OPTIONS,
  resources,
  SUPPORTED_LANGUAGES,
} from './i18nConfig';

describe('i18n config', () => {
  it('registers resources for every supported language', () => {
    expect(Object.keys(resources).sort()).toEqual([...SUPPORTED_LANGUAGES].sort());
    expect(LANGUAGE_OPTIONS.map((option) => option.value)).toEqual(SUPPORTED_LANGUAGES);
  });

  it('keeps every locale file in sync with english keys', () => {
    const englishKeys = Object.keys(resources.en.translation).sort();

    SUPPORTED_LANGUAGES.forEach((language) => {
      expect(Object.keys(resources[language].translation).sort()).toEqual(englishKeys);
    });
  });

  it('prefers a supported preferred language, then stored language, then english', () => {
    expect(getInitialLanguage('pt', 'fr')).toBe('pt');
    expect(getInitialLanguage('de', 'ru')).toBe('ru');
    expect(getInitialLanguage('de', 'it')).toBe('en');
  });

  it('returns rtl only for arabic', () => {
    expect(getLanguageDirection('ar')).toBe('rtl');
    expect(getLanguageDirection('en')).toBe('ltr');
    expect(getLanguageDirection('zh')).toBe('ltr');
  });

  it('includes translated labels for the newly added languages', () => {
    expect(resources.zh.translation.language).toBe('语言');
    expect(resources.pt.translation.language).toBe('Idioma');
    expect(resources.ru.translation.language).toBe('Язык');
    expect(resources.ar.translation.language).toBe('اللغة');
    expect(resources.ar.translation['header-sustainable-energy-hub']).toBe('مركز الطاقة المستدامة');
  });
});
