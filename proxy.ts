import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  // Add your proxy logic here
  // Example: Modify headers, redirect, rewrite, etc.
  
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
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
