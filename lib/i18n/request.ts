import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales, Locale } from './config';

// Deep merge function to combine messages with fallback
function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): Record<string, unknown> {
  const result = { ...target };
  for (const key of Object.keys(source)) {
    if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>
      );
    } else if (result[key] === undefined || (typeof result[key] === 'string' && (result[key] as string).startsWith('['))) {
      // Use source (English) if target is undefined OR if target is a placeholder like [ES]
      result[key] = source[key];
    }
  }
  return result;
}

export default getRequestConfig(async () => {
  // Always load English as fallback
  const englishMessages = (await import(`@/messages/en.json`)).default;

  // Priority: 1. Cookie, 2. Accept-Language header, 3. Default
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value as Locale | undefined;

  let locale: Locale = defaultLocale;

  if (localeCookie && locales.includes(localeCookie)) {
    locale = localeCookie;
  } else {
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');
    if (acceptLanguage) {
      const preferredLocale = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim().substring(0, 2))
        .find(lang => locales.includes(lang as Locale)) as Locale | undefined;

      if (preferredLocale) {
        locale = preferredLocale;
      }
    }
  }

  // If locale is English, just return English messages
  if (locale === 'en') {
    return {
      locale,
      messages: englishMessages,
    };
  }

  // For other locales, merge with English fallback (English fills in missing/placeholder translations)
  const localeMessages = (await import(`@/messages/${locale}.json`)).default;
  const mergedMessages = deepMerge(localeMessages, englishMessages);

  return {
    locale,
    messages: mergedMessages,
  };
});
