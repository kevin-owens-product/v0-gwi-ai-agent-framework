import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { auth } from '@/lib/auth';
import { locales, Locale } from '@/lib/i18n/config';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'en';
    return NextResponse.json({ locale });
  } catch (error) {
    console.error('Error getting language:', error);
    return NextResponse.json({ locale: 'en' });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { locale } = await request.json();

    if (!locale || !locales.includes(locale as Locale)) {
      return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
    }

    // Try to update user preferences if authenticated
    try {
      const session = await auth();
      if (session?.user?.id) {
        await prisma.userPreferences.upsert({
          where: { userId: session.user.id },
          update: { language: locale },
          create: {
            userId: session.user.id,
            language: locale,
          },
        });
      }
    } catch (authError) {
      // User might not be authenticated, that's okay
      console.log('User not authenticated, skipping preferences update');
    }

    // Create response with cookie set in header
    const response = NextResponse.json({ success: true, locale });
    response.cookies.set('locale', locale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: 'lax',
      httpOnly: false, // Allow JS access for client-side reading
    });

    return response;
  } catch (error) {
    console.error('Error updating language:', error);
    return NextResponse.json({ error: 'Failed to update language' }, { status: 500 });
  }
}
