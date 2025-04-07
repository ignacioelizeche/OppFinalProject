import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // For preview purposes, we'll bypass the middleware
  // This allows us to access all pages without authentication
  return NextResponse.next()

  /* Original middleware logic - commented out for preview
  const token = request.cookies.get("token")?.value
  const isAuthPage = request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register"

  // If trying to access an auth page while logged in, redirect to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  // If trying to access a protected page without being logged in, redirect to login
  if (!isAuthPage && !token && !request.nextUrl.pathname.startsWith("/_next")) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
  */
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/problems/:path*",
    "/calendar/:path*",
    "/forum/:path*",
    "/visualizations/:path*",
    "/leaderboard",
    "/login",
    "/register",
  ],
}

