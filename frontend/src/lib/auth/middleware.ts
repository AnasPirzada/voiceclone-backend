import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/", "/auth/login", "/auth/register"];
const ADMIN_PATHS = ["/admin"];

export function authMiddleware(request: NextRequest): NextResponse | undefined {
  const token = request.cookies.get("next-auth.session-token")?.value;
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.includes(pathname)) {
    return undefined;
  }

  if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
    if (!token) {
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return undefined;
}
