import { NextRequest } from "next/server";
import authConfig from "./auth.config";
import NextAuth from "next-auth";

// Use only one of the two middleware options below
// 1. Use middleware directly
// export const { auth: middleware } = NextAuth(authConfig)

// 2. Wrapped middleware option
const { auth } = NextAuth(authConfig);
export default auth(async function middleware(req: NextRequest) {
  const publicRoutes = ["/", "/signin", "/register", "/verify", "/subscription"];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  const session = await auth();

  // console.log(`Session: ${JSON.stringify(session)}`);
  

  if (!session && !isPublicRoute) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (
    session &&
    (req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/register")
  ) {
    const newUrl = new URL("/clip", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
