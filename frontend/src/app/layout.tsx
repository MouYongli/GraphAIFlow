"use client";
import "./globals.css";
import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import Header from "@/components/common/Header";
import { getOptions, languages } from '@/i18n/settings';

const i18n = i18next.createInstance();
i18n.use(initReactI18next);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initI18n = async () => {
      try {
        // 动态导入所有配置的语言翻译
        const translations = await Promise.all(
          languages.map(async (lang) => {
            const module = await import(`@/i18n/${lang}/common.json`);
            return { lang, translation: module.default };
          })
        );

        // 构建 resources 对象
        const resources = translations.reduce((acc, { lang, translation }) => ({
          ...acc,
          [lang]: {
            common: translation,
          }
        }), {});

        await i18n.init({
          ...getOptions(),
          resources,
        });

        setInitialized(true);
      } catch (error) {
        console.error('Failed to initialize i18n:', error);
      }
    };

    initI18n();
  }, []);

  return (
    <html lang="en">
      <body>
        {initialized ? (
          <I18nextProvider i18n={i18n}>
            {/* 全局头部 (如导航、Logo等) */}
            <Header />
            {/* 页面内容 */}
            {children}
          </I18nextProvider>
        ) : (
          // 即使在加载状态下，也保持相同的外层结构
          <div>Loading...</div>
        )}
      </body>
    </html>
  );
}