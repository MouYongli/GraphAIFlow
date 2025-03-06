"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, languageLabels } from '@/i18n/settings';
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from '@headlessui/react';

const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState<string>(i18n.language || 'en');

  // 确保在组件挂载后同步 i18n 的当前语言状态
  useEffect(() => {
    if (i18n.language && i18n.language !== selectedLanguage) {
      setSelectedLanguage(i18n.language);
    }
  }, [i18n.language]);

  const handleChange = (value: string) => {
    setSelectedLanguage(value);
    if (i18n.changeLanguage) {
      i18n.changeLanguage(value);
    }
  };

  return (
    <div className="relative w-32">
      <Listbox value={selectedLanguage} onChange={handleChange}>
        <ListboxButton className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-left text-gray-900 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
          {languageLabels[selectedLanguage]}
        </ListboxButton>
        <ListboxOptions className="absolute mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
          {languages.map((lang) => (
            <ListboxOption
              key={lang}
              value={lang}
              className={({ active }) =>
                `cursor-pointer px-3 py-2 ${active ? 'bg-indigo-500 text-white' : 'text-gray-900'}`
              }
            >
              {languageLabels[lang]}
            </ListboxOption>
          ))}
        </ListboxOptions>
      </Listbox>
    </div>
  );
};

export default LanguageSwitcher;
