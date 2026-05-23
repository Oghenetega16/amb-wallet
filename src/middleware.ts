import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // Redirect root to dashboard (already protected)
    return NextResponse.next();
  },
  {
    callbacks: {
      // Return true = allow, false = redirect to sign in
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  }
);

export const config = {
  // Protect everything except auth routes, API routes, and static files
  matcher: [
    "/((?!auth|api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)",
  ],
};
