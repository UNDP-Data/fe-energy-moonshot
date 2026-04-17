import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { resources } from './i18nConfig';

i18next
  .use(initReactI18next)
  .init({
    resources,
    debug: false,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18next;
