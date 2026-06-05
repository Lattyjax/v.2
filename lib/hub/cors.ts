import { NextRequest, NextResponse } from 'next/server';

const ALLOWED_ORIGINS = [
  'https://www.latimorelifelegacy.com',
  'https://latimorelifelegacy.com',
  'https://lifeandlegacy.vercel.app',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000','http://localhost:3001'] : []),
];

export function getCorsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
  };
}

export function withCors(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest): Promise<NextResponse> => {
    const origin = req.headers.get('origin');
    const corsHeaders = getCorsHeaders(origin);
    if (req.method === 'OPTIONS') return new NextResponse(null, { status: 204, headers: corsHeaders });
    const res = await handler(req);
    Object.entries(corsHeaders).forEach(([k, v]) => res.headers.set(k, v));
    return res;
  };
}

export async function handleOptions(req: NextRequest) {
  return new NextResponse(null, { status: 204, headers: getCorsHeaders(req.headers.get('origin')) });
}
