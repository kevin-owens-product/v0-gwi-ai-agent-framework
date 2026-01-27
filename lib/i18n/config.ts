export const locales = ['en', 'zh', 'es', 'hi', 'fr', 'ar', 'pt', 'ru', 'ja', 'bn'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  hi: 'हिन्दी',
  fr: 'Français',
  ar: 'العربية',
  pt: 'Português',
  ru: 'Русский',
  ja: '日本語',
  bn: 'বাংলা',
};

export const localeFlags: Record<Locale, string> = {
  en: '🇺🇸',
  zh: '🇨🇳',
  es: '🇪🇸',
  hi: '🇮🇳',
  fr: '🇫🇷',
  ar: '🇸🇦',
  pt: '🇧🇷',
  ru: '🇷🇺',
  ja: '🇯🇵',
  bn: '🇧🇩',
};

// RTL languages
export const rtlLocales: Locale[] = ['ar'];

export function isRtlLocale(locale: Locale): boolean {
  return rtlLocales.includes(locale);
}
