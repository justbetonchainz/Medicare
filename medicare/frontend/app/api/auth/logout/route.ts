import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api } from '@/lib/api';
import { ACCESS_COOKIE, REFRESH_COOKIE } from '@/lib/auth';

export async function POST(): Promise<NextResponse> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (token) {
    try {
      await api.post('/auth/logout', undefined, token);
    } catch {
      /* ignore */
    }
  }
  const res = NextResponse.redirect(
    new URL('/', process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'),
  );
  res.cookies.delete(ACCESS_COOKIE);
  res.cookies.delete(REFRESH_COOKIE);
  return res;
}
