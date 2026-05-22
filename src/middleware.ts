// src/middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/utils/jwt-edge";

// Routes that require authentication
const PROTECTED_PATHS = ["/dashboard", "/rooms", "/devices", "/schedules"];
// Routes only for unauthenticated users
const AUTH_PATHS = ["/login", "/register"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("token")?.value;

  const isProtected = PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  const isAuthPage = AUTH_PATHS.some((p) => pathname.startsWith(p));

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    try {
      await verifyTokenEdge(token);
      return NextResponse.redirect(new URL("/dashboard", req.url));
    } catch {
      // Token invalid — let them through to login
    }
  }

  // Redirect unauthenticated users from protected pages
  if (isProtected && !token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isProtected && token) {
    try {
      await verifyTokenEdge(token);
    } catch {
      // Expired or invalid — clear cookie and redirect
      const response = NextResponse.redirect(new URL("/login", req.url));
      response.cookies.set("token", "", { maxAge: 0 });
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
