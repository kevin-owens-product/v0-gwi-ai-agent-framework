'use client';

import { useTranslations } from 'next-intl';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { locales, localeNames, localeFlags, Locale } from '@/lib/i18n/config';
import { useLocalePreference } from '@/hooks/use-locale';

export function LanguageSettings() {
  const t = useTranslations('settings');
  const { locale, setLocale, isLoading } = useLocalePreference();

  const handleChange = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('language')}</CardTitle>
        <CardDescription>{t('selectLanguage')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language-select">{t('language')}</Label>
          <Select
            value={locale}
            onValueChange={handleChange}
            disabled={isLoading}
          >
            <SelectTrigger id="language-select" className="w-full max-w-xs">
              <SelectValue>
                <span className="flex items-center gap-2">
                  <span>{localeFlags[locale]}</span>
                  <span>{localeNames[locale]}</span>
                </span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {locales.map((loc) => (
                <SelectItem key={loc} value={loc}>
                  <span className="flex items-center gap-2">
                    <span>{localeFlags[loc]}</span>
                    <span>{localeNames[loc]}</span>
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
