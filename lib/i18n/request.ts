import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, locales, Locale } from './config';

export default getRequestConfig(async () => {
  // Priority: 1. Cookie, 2. Accept-Language header, 3. Default
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('locale')?.value as Locale | undefined;

  if (localeCookie && locales.includes(localeCookie)) {
    return {
      locale: localeCookie,
      messages: (await import(`@/messages/${localeCookie}.json`)).default,
    };
  }

  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');
  if (acceptLanguage) {
    const preferredLocale = acceptLanguage
      .split(',')
      .map(lang => lang.split(';')[0].trim().substring(0, 2))
      .find(lang => locales.includes(lang as Locale)) as Locale | undefined;

    if (preferredLocale) {
      return {
        locale: preferredLocale,
        messages: (await import(`@/messages/${preferredLocale}.json`)).default,
      };
    }
  }

  return {
    locale: defaultLocale,
    messages: (await import(`@/messages/${defaultLocale}.json`)).default,
  };
});
