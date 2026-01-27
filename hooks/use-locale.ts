'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Locale, defaultLocale, locales } from '@/lib/i18n/config';

export function useLocalePreference() {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocale = async () => {
      try {
        const response = await fetch('/api/settings/language');
        if (response.ok) {
          const data = await response.json();
          if (locales.includes(data.locale)) {
            setLocaleState(data.locale);
          }
        }
      } catch (error) {
        console.error('Failed to fetch locale:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocale();
  }, []);

  const setLocale = useCallback(async (newLocale: Locale) => {
    try {
      const response = await fetch('/api/settings/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (response.ok) {
        setLocaleState(newLocale);
        router.refresh();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to set locale:', error);
      return false;
    }
  }, [router]);

  return { locale, setLocale, isLoading };
}
