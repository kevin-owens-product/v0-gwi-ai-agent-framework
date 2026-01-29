import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { NextIntlClientProvider } from 'next-intl'
import { getLocale, getMessages } from 'next-intl/server'
import { isRtlLocale, Locale } from '@/lib/i18n/config'
import { Toaster } from 'sonner'

// Use CSS variables for fonts instead of next/font/google to avoid build-time network calls
// The fonts will be loaded via CSS if available, with fallbacks to system fonts

export const metadata: Metadata = {
  title: "GWI Insights | AI-Powered Human Intelligence Platform",
  description:
    "Transform how you understand people with autonomous AI agents. Build, deploy, and orchestrate intelligent workflows that turn human data into strategic insights.",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale() as Locale;
  const messages = await getMessages();
  const dir = isRtlLocale(locale) ? 'rtl' : 'ltr';

  return (
    <html lang={locale} dir={dir} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Geist:wght@100..900&family=Geist+Mono:wght@100..900&display=swap" rel="stylesheet" />
        {process.env.NODE_ENV === 'development' && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function() {
                  const originalLog = console.log;
                  const originalInfo = console.info;
                  const originalWarn = console.warn;
                  
                  const suppressPatterns = [
                    /\\[Fast Refresh\\]/i,
                    /Fast Refresh/i,
                    /rebuilding/i,
                    /HMR/i,
                    /Hot Module Replacement/i
                  ];
                  
                  const shouldSuppress = (message) => {
                    const messageStr = typeof message === 'string' ? message : String(message);
                    return suppressPatterns.some(pattern => pattern.test(messageStr));
                  };
                  
                  console.log = function(...args) {
                    if (!shouldSuppress(args[0])) {
                      originalLog.apply(console, args);
                    }
                  };
                  
                  console.info = function(...args) {
                    if (!shouldSuppress(args[0])) {
                      originalInfo.apply(console, args);
                    }
                  };
                  
                  console.warn = function(...args) {
                    if (!shouldSuppress(args[0])) {
                      originalWarn.apply(console, args);
                    }
                  };
                })();
              `,
            }}
          />
        )}
      </head>
      <body className="font-sans antialiased" style={{ fontFamily: 'Geist, system-ui, arial, sans-serif' }} suppressHydrationWarning>
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            defaultTheme="system"
            storageKey="gwi-theme"
            enableSystem
            disableTransitionOnChange={false}
          >
            {children}
            <Toaster richColors position="top-right" />
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
