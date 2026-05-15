import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api, ApiError } from '@/lib/api';
import { ACCESS_COOKIE } from '@/lib/auth';
import type { Appointment } from '@/types';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 },
    );
  }
  const body = await req.json();
  try {
    const data = await api.post<Appointment>('/appointments', body, token);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    const err = e as ApiError;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.status ?? 400 },
    );
  }
}
