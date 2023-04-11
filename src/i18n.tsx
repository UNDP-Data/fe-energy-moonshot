import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import trEn from './lang/en/translation.json';
import trEs from './lang/es/translation.json';

const resources = {
  en: {
    translation: trEn,
  },
  es: {
    translation: trEs,
  },
};

i18next
  .use(initReactI18next)
  .init({
    resources,
    debug: true,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    },
  });

export default i18next;
