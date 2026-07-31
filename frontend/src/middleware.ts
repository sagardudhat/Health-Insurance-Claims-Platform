import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { USER_ROLES, ROLE_DASHBOARDS, UserRole } from './config/constants';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('user_role')?.value as UserRole | undefined;

  const isAuthRoute = pathname === '/login' || pathname === '/register';
  const isProtectedPath =
    pathname.startsWith('/provider') ||
    pathname.startsWith('/reviewer') ||
    pathname.startsWith('/admin');

  // 1. If unauthenticated user tries to access protected paths -> Redirect to /login
  if (!token && isProtectedPath) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 2. If authenticated user tries to visit /login or /register -> Redirect to role dashboard
  if (token && isAuthRoute && userRole && ROLE_DASHBOARDS[userRole]) {
    return NextResponse.redirect(new URL(ROLE_DASHBOARDS[userRole], request.url));
  }

  // 3. Strict Role-Based Route Mismatch Protection
  if (token && userRole) {
    const isClaimDetailsPath =
      pathname.startsWith('/provider/claims/') && pathname !== '/provider/claims/new';

    if (
      userRole === USER_ROLES.PROVIDER &&
      (pathname.startsWith('/reviewer') || pathname.startsWith('/admin'))
    ) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[USER_ROLES.PROVIDER], request.url));
    }

    if (
      userRole === USER_ROLES.REVIEWER &&
      !isClaimDetailsPath &&
      (pathname.startsWith('/provider') || pathname.startsWith('/admin'))
    ) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[USER_ROLES.REVIEWER], request.url));
    }

    if (userRole === USER_ROLES.ADMIN && !isClaimDetailsPath && pathname.startsWith('/provider')) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[USER_ROLES.ADMIN], request.url));
    }
  }

  // 4. Handle root / route
  if (pathname === '/') {
    if (token && userRole && ROLE_DASHBOARDS[userRole]) {
      return NextResponse.redirect(new URL(ROLE_DASHBOARDS[userRole], request.url));
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};
