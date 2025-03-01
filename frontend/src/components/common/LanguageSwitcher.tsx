'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { languages, languageLabels } from '@/i18n/settings';
import { Combobox } from '@headlessui/react';

const LanguageSwitcher: React.FC = () => {
    const { i18n } = useTranslation();
    const [selectedLanguage, setSelectedLanguage] = useState(i18n.language || 'en');

    const handleChange = (value: string) => {
        setSelectedLanguage(value);
        if (i18n.changeLanguage) {
            i18n.changeLanguage(value);
        }
    };

    return (
        <div className="relative w-32">
            <Combobox value={selectedLanguage} onChange={handleChange}>
                <Combobox.Button className="w-full rounded-lg border border-gray-400 bg-white px-3 py-2 text-left text-gray-900 shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {languageLabels[selectedLanguage]}
                </Combobox.Button>
                <Combobox.Options className="absolute mt-1 w-full rounded-lg border border-gray-300 bg-white shadow-lg">
                    {languages.map((lang) => (
                        <Combobox.Option 
                            key={lang} 
                            value={lang} 
                            className={({ active }) => `cursor-pointer px-3 py-2 ${active ? 'bg-indigo-500 text-white' : 'text-gray-900'}`}
                        >
                            {languageLabels[lang]}
                        </Combobox.Option>
                    ))}
                </Combobox.Options>
            </Combobox>
        </div>
    );
};

export default LanguageSwitcher;