import { getAuthenticatedAppForUser } from "@/lib/firebase/server/serverApp";
import { NextRequest, NextResponse } from "next/server";

// Middleware to ensure user is authenticated before accessing protected routes
// By default, all routes are protected unless specified otherwise

const unprotectedRoutes = ["/", "/login", "/register"];

export async function middleware(request: NextRequest) {
  if (unprotectedRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Protect all other routes
  const { currentUser } = await getAuthenticatedAppForUser();

  if (!currentUser) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|.*\\.png$|.*\\.svg$|.*\\.jpg$|.*\\.jpeg$).*)",
  ],
};
