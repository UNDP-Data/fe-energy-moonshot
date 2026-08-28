import {
  getInitialLanguage,
  getLanguageDirection,
  LANGUAGE_OPTIONS,
  loadTranslationResources,
  resources,
  SUPPORTED_LANGUAGES,
} from './i18nConfig';

describe('i18n config', () => {
  it('registers resources for every supported language', () => {
    expect(Object.keys(resources)).toEqual(['en']);
    expect(LANGUAGE_OPTIONS.map((option) => option.value)).toEqual(SUPPORTED_LANGUAGES);
  });

  it('keeps every locale file in sync with english keys', async () => {
    const englishKeys = Object.keys(resources.en.translation).sort();

    await Promise.all(SUPPORTED_LANGUAGES.map(async (language) => {
      const translation = await loadTranslationResources(language);
      expect(Object.keys(translation).sort()).toEqual(englishKeys);
    }));
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

  it('includes translated labels for the newly added languages', async () => {
    const [zh, pt, ru, ar] = await Promise.all([
      loadTranslationResources('zh'),
      loadTranslationResources('pt'),
      loadTranslationResources('ru'),
      loadTranslationResources('ar'),
    ]);
    expect(zh.language).toBe('语言');
    expect(pt.language).toBe('Idioma');
    expect(ru.language).toBe('Язык');
    expect(ar.language).toBe('اللغة');
    expect(ar['header-sustainable-energy-hub']).toBe('متتبع Energy Moonshot');
  });

  it('uses title-style capitalization for the split logo title where casing applies', async () => {
    await Promise.all((['en', 'es', 'fr', 'pt', 'ru'] as const).map(async (language) => {
      const translation = await loadTranslationResources(language);
      [
        'header-title-sustainable',
        'header-title-energy',
        'header-title-tracker',
      ].forEach((key) => {
        const value = translation[key];
        expect(value[0]).toBe(value[0].toLocaleUpperCase(language));
      });
    }));
  });
});
