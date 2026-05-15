import { cookies } from 'next/headers';
import { jwtVerify, type JWTPayload } from 'jose';
import type { Role } from '@/types';

export const ACCESS_COOKIE = 'medrdv_access';
export const REFRESH_COOKIE = 'medrdv_refresh';

export interface SessionUser {
  sub: string;
  email: string;
  role: Role;
}

export async function getSession(): Promise<SessionUser | null> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(
      process.env.JWT_ACCESS_SECRET ?? 'change-me-access-secret',
    );
    const { payload } = await jwtVerify(token, secret);
    const p = payload as JWTPayload & { sub?: string; email?: string; role?: Role };
    if (!p.sub || !p.email || !p.role) return null;
    return { sub: p.sub, email: p.email, role: p.role };
  } catch {
    return null;
  }
}

export function getAccessTokenFromCookies(): string | undefined {
  return cookies().get(ACCESS_COOKIE)?.value;
}
