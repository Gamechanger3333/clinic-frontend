import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// BUG FIX 1+2: Don't use verifyToken() in middleware — it uses wrong secret
// and wrong cookie name. Instead just check if clinicflow_access cookie exists.
// The actual token validation happens in Express via /api/auth/me.
// ProtectedRoute component handles client-side auth guard via AuthContext.

const PROTECTED_PREFIX = [
  "/dashboard", "/patients", "/appointments", "/prescriptions",
  "/admin", "/settings", "/doctors", "/departments",
  "/lab-reports", "/medical-records", "/pharmacy", "/billing", "/notifications"
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Use Express cookie name
  const accessToken = request.cookies.get("clinicflow_access")?.value;
  const refreshToken = request.cookies.get("clinicflow_refresh")?.value;
  const hasSession = !!(accessToken || refreshToken);

  const isProtected = PROTECTED_PREFIX.some((p) => pathname.startsWith(p));

  // Redirect to auth if no session on protected routes
  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL("/auth", request.url));
  }

  // Redirect to dashboard if already logged in and visiting auth
  if (pathname === "/auth" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.ico).*)",
  ],
};
