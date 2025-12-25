import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/signup", "/"];
  const isPublicRoute =
    publicRoutes.includes(pathname) || pathname.startsWith("/api/auth");

  // Check session for protected routes
  if (!isPublicRoute) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Redirect to login if no session
      if (!session?.user) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
    } catch (_error) {
      // If session check fails, redirect to login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Redirect authenticated users away from auth pages
  if (pathname === "/login" || pathname === "/signup") {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (session?.user) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch {
      // Continue to auth page if session check fails
    }
  }

  return NextResponse.next();
}

// Optional: Configure which routes the proxy should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (PWA icons and static assets)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|icons).*)",
  ],
};
