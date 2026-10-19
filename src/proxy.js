import { NextResponse } from "next/server";

export function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("token")?.value;
  const hasToken = Boolean(token && token !== "undefined" && token !== "null");

  const isAuthRoute = pathname.startsWith("/auth");

  // If user is already logged in and tries to access /auth, redirect to home
  if (hasToken && isAuthRoute) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If user is not logged in and tries to access protected pages, redirect to /auth
  if (!hasToken && !isAuthRoute) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico and static assets
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};