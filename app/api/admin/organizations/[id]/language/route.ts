import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/db';
import { validateSuperAdminSession } from '@/lib/super-admin';
import { locales, Locale } from '@/lib/i18n/config';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await validateSuperAdminSession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  try {
    const org = await prisma.organization.findUnique({
      where: { id },
      select: { id: true, name: true, defaultLanguage: true },
    });

    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    return NextResponse.json(org);
  } catch (error) {
    console.error('Error getting organization language:', error);
    return NextResponse.json({ error: 'Failed to get organization' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const cookieStore = await cookies();
  const token = cookieStore.get('adminToken')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const session = await validateSuperAdminSession(token);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const { defaultLanguage } = await request.json();

  if (!defaultLanguage || !locales.includes(defaultLanguage as Locale)) {
    return NextResponse.json({ error: 'Invalid locale' }, { status: 400 });
  }

  try {
    const org = await prisma.organization.update({
      where: { id },
      data: { defaultLanguage },
      select: { id: true, name: true, defaultLanguage: true },
    });
    return NextResponse.json(org);
  } catch (error) {
    console.error('Error updating organization language:', error);
    return NextResponse.json({ error: 'Failed to update organization' }, { status: 500 });
  }
}
