import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Public routes that don't require authentication
  const publicRoutes = ['/', '/login'];
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/athlete', '/nutritionist'];
  
  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.includes(pathname);
  
  // For now, we'll allow all routes since we're using client-side auth
  // In a production app, you'd check for auth tokens here
  
  // Redirect root dashboard to role-specific dashboard
  if (pathname === '/dashboard') {
    // For demo purposes, we'll redirect to athlete dashboard as default
    // In production, you'd check the user's role from auth state
    return NextResponse.redirect(new URL('/athlete', request.url));
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};