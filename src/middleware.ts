/**
 * src/middleware.ts — Next.js Route-Level Auth Guard
 *
 * - Checks for session cookies before allowing access to protected pages
 * - Redirects unauthenticated users to /auth
 * - Redirects authenticated users away from /auth
 * - Does NOT validate tokens (that is the Express backend's job)
 * - Token validation happens on every API call via the Express middleware
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Cookie names must match backend definitions in src/lib/auth.ts
const ACCESS_COOKIE  = "cf_at";
const REFRESH_COOKIE = "cf_rt";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/patients",
  "/appointments",
  "/prescriptions",
  "/admin",
  "/settings",
  "/doctors",
  "/departments",
  "/lab-reports",
  "/medical-records",
  "/pharmacy",
  "/billing",
  "/notifications",
];

const PUBLIC_PATHS = [
  "/auth",
  "/auth/verify-email",
  "/auth/reset-password",
  "/health",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const accessToken  = request.cookies.get(ACCESS_COOKIE)?.value;
  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  const hasSession   = !!(accessToken || refreshToken);

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isPublicAuth = PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"));

  // Redirect to /auth if accessing protected pages without a session
  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    url.searchParams.set("redirectTo", pathname);
    return NextResponse.redirect(url);
  }

  // Redirect to /dashboard if already logged in and visiting /auth
  if (isPublicAuth && hasSession && pathname === "/auth") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static assets
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.jpg|.*\\.jpeg|.*\\.png|.*\\.svg|.*\\.ico|.*\\.webp).*)",
  ],
};