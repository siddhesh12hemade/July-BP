import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import * as resources from "./resources";

i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    resources: {
      ...Object.entries(resources).reduce(
        (acc, [key, value]) => ({
          ...acc,
          [key]: {
            translation: value,
          },
        }),
        {}
      ),
    },
    lng: "en",
    fallbackLng: "en",
  });

export default i18n;
