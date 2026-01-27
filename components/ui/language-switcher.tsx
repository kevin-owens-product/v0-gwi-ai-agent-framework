'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Globe, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { locales, localeNames, localeFlags, Locale } from '@/lib/i18n/config';

interface LanguageSwitcherProps {
  currentLocale?: Locale;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  showLabel?: boolean;
  align?: 'start' | 'center' | 'end';
}

export function LanguageSwitcher({
  currentLocale = 'en',
  variant = 'ghost',
  size = 'sm',
  showLabel = false,
  align = 'end',
}: LanguageSwitcherProps) {
  const router = useRouter();
  const t = useTranslations('ui.languageSwitcher');
  const [locale, setLocale] = React.useState<Locale>(currentLocale);
  const [isPending, setIsPending] = React.useState(false);

  // Fetch current locale on mount
  React.useEffect(() => {
    const fetchLocale = async () => {
      try {
        const response = await fetch('/api/settings/language');
        if (response.ok) {
          const data = await response.json();
          if (locales.includes(data.locale)) {
            setLocale(data.locale);
          }
        }
      } catch (error) {
        console.error('Failed to fetch locale:', error);
      }
    };
    fetchLocale();
  }, []);

  const handleLanguageChange = async (newLocale: Locale) => {
    if (newLocale === locale) return;

    setIsPending(true);
    try {
      const response = await fetch('/api/settings/language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale: newLocale }),
      });

      if (response.ok) {
        setLocale(newLocale);
        router.refresh();
      }
    } catch (error) {
      console.error('Failed to change language:', error);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isPending}>
          <Globe className="h-4 w-4" />
          {showLabel && (
            <span className="ml-2">
              {localeFlags[locale]} {localeNames[locale]}
            </span>
          )}
          <span className="sr-only">{t('switchLanguage')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48 max-h-80 overflow-y-auto">
        {locales.map((loc) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => handleLanguageChange(loc)}
            className={locale === loc ? 'bg-accent' : ''}
          >
            <span className="mr-2 text-base">{localeFlags[loc]}</span>
            <span className="flex-1">{localeNames[loc]}</span>
            {locale === loc && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
