import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken, COOKIE_NAME } from "@/lib/auth";

const PUBLIC_PATHS = ["/", "/auth"];
const PROTECTED_PREFIX = ["/dashboard", "/patients", "/appointments", "/prescriptions", "/admin", "/settings", "/doctors", "/departments", "/lab-reports", "/medical-records", "/pharmacy", "/billing", "/notifications"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(COOKIE_NAME)?.value;
  const isProtected = PROTECTED_PREFIX.some((p) => pathname.startsWith(p));

  if (isProtected) {
    if (!token) return NextResponse.redirect(new URL("/auth", request.url));
    const payload = await verifyToken(token);
    if (!payload) {
      const res = NextResponse.redirect(new URL("/auth", request.url));
      res.cookies.delete(COOKIE_NAME);
      return res;
    }
    if (pathname.startsWith("/admin") && payload.role !== "admin")
      return NextResponse.redirect(new URL("/dashboard", request.url));
    if (pathname.startsWith("/departments") && payload.role !== "admin")
      return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (PUBLIC_PATHS.includes(pathname) && pathname === "/auth" && token) {
    const payload = await verifyToken(token);
    if (payload) return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.jpg|.*\\.png|.*\\.svg|.*\\.ico).*)",],
};
