# Internationalization (i18n)

This directory contains the internationalization (i18n) resource files for the MedAgent frontend project.

## Directory Structure

```
src/i18n/
├── README.md
├── settings.ts     # i18n configuration file
├── index.ts        # i18n initialization file
├── en/             
│   └── common.json # English translations
├── zh/             
│   └── common.json # Chinese translations
└── de/             
    └── common.json # German translations
```

## Configuration

### Language Settings (`settings.ts`)
```typescript
export const languages = ['en', 'zh', 'de']
export const languageLabels = {
  'en': 'English',
  'zh': '中文',
  'de': 'Deutsch'
}
```

## Adding a New Language

1. Update `settings.ts`:
   - Add the language code to `languages` array
   - Add the display name to `languageLabels` object
2. Create Translation File and Folder:
   - Create a new directory with the language code, such as `fr`
   - Inside the directory, add `common.json` with translations

Example:
```json
{
    "home": {
        "title": "Your Title",
        "subtitle": "Your Subtitle",
        "try_now": "Try Now"
    },
    "nav": {
        "home": "Home",
        "chat": "Chat",
        "studio": "Studio",
        "dashboard": "Dashboard",
        "sign_in": "Sign In"
    }
}
```

## Usage in Components

```tsx
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  return <div>{t('key.subkey')}</div>;
}
```

## Supported Languages
- English (en)
- Chinese (zh)
- German (de)

## Language Switching

The language switcher component is available at `components/common/LanguageSwitcher.tsx` and can be used to change languages dynamically.

## Notes

1. Ensure all language files have consistent key structures
2. All translations must be present in all language files
3. Use semantic key names for better maintenance
4. The system will automatically load translations for all configured languages
5. Default language is set to 'en' (English)