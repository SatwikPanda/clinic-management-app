import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  const {
    data: { session },
  } = await supabase.auth.getSession();

  // Protected routes
  if (!session && (
    req.nextUrl.pathname.startsWith('/doctor-dashboard') ||
    req.nextUrl.pathname.startsWith('/patient-dashboard')
  )) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return res;
}

export const config = {
  matcher: [
    '/doctor-dashboard/:path*',
    '/patient-dashboard/:path*',
    '/book-appointment/:path*',
  ],
};
