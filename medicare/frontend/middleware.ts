import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, type JWTPayload } from 'jose';
import type { Role } from '@/types';

const ACCESS_COOKIE = 'medrdv_access';

const ROLE_PREFIX: Record<Role, string> = {
  patient: '/patient',
  doctor: '/doctor',
  admin: '/admin',
};

async function readRole(token: string): Promise<Role | null> {
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
    );
    const { payload } = await jwtVerify(token, secret);
    const p = payload as JWTPayload & { role?: Role };
    return p.role ?? null;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(ACCESS_COOKIE)?.value;
  const role = token ? await readRole(token) : null;

  const isProtected =
    pathname.startsWith('/patient') ||
    pathname.startsWith('/doctor') ||
    pathname.startsWith('/admin');

  if (isProtected) {
    if (!role) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.searchParams.set('next', pathname);
      return NextResponse.redirect(url);
    }
    const allowedPrefix = ROLE_PREFIX[role];
    if (!pathname.startsWith(allowedPrefix)) {
      const url = req.nextUrl.clone();
      url.pathname = `${allowedPrefix}/dashboard`;
      return NextResponse.redirect(url);
    }
  }

  if ((pathname === '/login' || pathname === '/register') && role) {
    const url = req.nextUrl.clone();
    url.pathname = `${ROLE_PREFIX[role]}/dashboard`;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/patient/:path*',
    '/doctor/:path*',
    '/admin/:path*',
  ],
};
