import { auth } from '@/lib/auth/config';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const path = nextUrl.pathname;
  const role = (session?.user as { role?: string })?.role;

  // Admin routes
  if (path.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
    if (!['OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role || '')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Kitchen routes
  if (path.startsWith('/kitchen')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
    if (!['CHEF', 'KITCHEN', 'OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role || '')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // Waiter routes
  if (path.startsWith('/waiter')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
    if (!['WAITER', 'OWNER', 'MANAGER', 'SUPER_ADMIN'].includes(role || '')) {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/kitchen/:path*', '/waiter/:path*'],
};
