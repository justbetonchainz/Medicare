import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';

async function forward(
  req: NextRequest,
  path: string[],
  method: string,
): Promise<NextResponse> {
  const token = cookies().get(ACCESS_COOKIE)?.value;
  const url = `${API_URL}/${path.join('/')}${req.nextUrl.search}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const body =
    method === 'GET' || method === 'DELETE' ? undefined : await req.text();

  const upstream = await fetch(url, {
    method,
    headers,
    body,
    cache: 'no-store',
  });
  const data = await upstream.text();
  return new NextResponse(data, {
    status: upstream.status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return forward(req, params.path, 'GET');
}
export async function POST(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return forward(req, params.path, 'POST');
}
export async function PATCH(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return forward(req, params.path, 'PATCH');
}
export async function DELETE(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  return forward(req, params.path, 'DELETE');
}
