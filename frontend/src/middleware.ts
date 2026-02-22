import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (PUBLIC_PATHS.includes(pathname)) {
    return NextResponse.next();
  }

  // Check for auth token in cookies (set by auth store)
  const hasAuth = request.cookies.get("vc-auth")?.value;

  if ((pathname.startsWith("/dashboard") || pathname.startsWith("/admin") || pathname.startsWith("/studio")) && !hasAuth) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/studio/:path*"],
};
