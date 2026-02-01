import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const JWT_SECRET = process.env.JWT_SECRET;

  // 1. Define Paths
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  // 2. Verify Token
  let isValid = false;

  if (token && JWT_SECRET) {
    try {
      // Create a secret key for 'jose'
      const secret = new TextEncoder().encode(JWT_SECRET);
      await jwtVerify(token, secret);
      isValid = true;
    } catch (error) {
      // Token is invalid or expired
      console.log('Middleware: Invalid token');
    }
  }

  // 3. Protection Logic
  if (isDashboard) {
    if (!isValid) {
      // User trying to access dashboard without valid token -> Redirect to Login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (isAuthPage) {
    if (isValid) {
      // User already logged in trying to access login page -> Redirect to Dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
