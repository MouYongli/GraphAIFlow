"use client";
import React, { ReactNode, useEffect, useState, createContext, useContext } from "react";
import { I18nextProvider } from "react-i18next";
import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { getOptions, languages } from "@/i18n/settings";

const i18n = i18next.createInstance();
i18n.use(initReactI18next);

interface I18nContextProps {
  changeLanguage: (lng: string) => void;
  currentLanguage: string;
}

export const I18nContext = createContext<I18nContextProps>({
  changeLanguage: () => {},
  currentLanguage: "en",
});

export default function I18nProvider({ children }: { children: ReactNode }) {
  const [initialized, setInitialized] = useState(false);
  const [language, setLanguage] = useState("en");

  useEffect(() => {
    const initI18n = async () => {
      try {
        const translations = await Promise.all(
          languages.map(async (lang) => {
            const module = await import(`@/i18n/${lang}/common.json`);
            return { lang, translation: module.default };
          })
        );

        const resources = translations.reduce(
          (acc, { lang, translation }) => ({
            ...acc,
            [lang]: { common: translation },
          }),
          {}
        );

        await i18n.init({
          ...getOptions(),
          resources,
          lng: language,
          fallbackLng: "en",
        });

        setInitialized(true);
      } catch (error) {
        console.error("Failed to initialize i18n:", error);
      }
    };

    initI18n();
  }, [language]);

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    setLanguage(lng);
  };

  if (!initialized) return null;

  return (
    <I18nextProvider i18n={i18n}>
      <I18nContext.Provider value={{ changeLanguage, currentLanguage: language }}>
        {children}
      </I18nContext.Provider>
    </I18nextProvider>
  );
}
