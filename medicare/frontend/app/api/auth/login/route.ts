import { NextRequest, NextResponse } from 'next/server';
import { api, ApiError } from '@/lib/api';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth';
import type { AuthResult } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const body = (await req.json()) as { email?: string; password?: string };
  if (!body.email || !body.password) {
    return NextResponse.json(
      { success: false, message: 'Missing credentials' },
      { status: 400 },
    );
  }

  try {
    const data = await api.post<AuthResult>('/auth/login', body);
    const res = NextResponse.json({ success: true, data: { user: data.user } });
    res.cookies.set(ACCESS_COOKIE, data.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60,
    });
    res.cookies.set(REFRESH_COOKIE, data.refreshToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (e) {
    const err = e as ApiError;
    return NextResponse.json(
      { success: false, message: err.message ?? 'Login failed' },
      { status: err.status ?? 401 },
    );
  }
}
