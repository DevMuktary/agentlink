import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '');

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Clone headers so we can inject our secure origin tag
  const requestHeaders = new Headers(req.headers);

  // 2. Determine Request Origin securely
  // If the request has an API key header, tag it as 'api'. Otherwise, it is 'dashboard'.
  const hasApiKey = req.headers.has('x-api-key') || req.headers.get('authorization')?.startsWith('Bearer ');
  
  if (hasApiKey) {
    requestHeaders.set('x-request-origin', 'api');
  } else {
    requestHeaders.set('x-request-origin', 'dashboard');
  }

  // 3. Define Route Categories
  const isPublicRoute = ['/login', '/register', '/forgot-password', '/admin/login'].includes(pathname);
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin') && pathname !== '/admin/login';
  const isV1ApiRoute = pathname.startsWith('/api/v1');

  // Prepare the base response with our injected headers
  const response = NextResponse.next({
    request: { headers: requestHeaders },
  });

  // 4. Bypass JWT check for external API Routes (handled by api-auth.ts)
  if (isV1ApiRoute) {
    return response;
  }

  // 5. Extract and Verify Session Token (Cookies)
  const token = req.cookies.get('token')?.value;
  let decodedToken: any = null;

  if (token) {
    try {
      const { payload } = await jwtVerify(token, secret);
      decodedToken = payload;
    } catch (error) {
      decodedToken = null;
    }
  }

  // 6. Route Protection Logic
  if (isPublicRoute && decodedToken) {
    const redirectUrl = decodedToken.role === 'ADMIN' || decodedToken.role === 'SUPER_ADMIN' 
      ? '/admin' 
      : '/dashboard';
    return NextResponse.redirect(new URL(redirectUrl, req.url));
  }

  if (isDashboardRoute && !decodedToken) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAdminRoute) {
    if (!decodedToken) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
    if (decodedToken.role !== 'ADMIN' && decodedToken.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
