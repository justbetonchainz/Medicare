import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { api, ApiError } from '@/lib/api';
import { ACCESS_COOKIE } from '@/lib/auth';

async function withToken(
  fn: (token: string) => Promise<unknown>,
): Promise<NextResponse> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  if (!token) {
    return NextResponse.json(
      { success: false, message: 'Not authenticated' },
      { status: 401 },
    );
  }
  try {
    const data = await fn(token);
    return NextResponse.json({ success: true, data });
  } catch (e) {
    const err = e as ApiError;
    return NextResponse.json(
      { success: false, message: err.message },
      { status: err.status ?? 400 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const body = await req.json();
  return withToken((t) => api.patch(`/appointments/${params.id}`, body, t));
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  return withToken((t) => api.delete(`/appointments/${params.id}`, t));
}
