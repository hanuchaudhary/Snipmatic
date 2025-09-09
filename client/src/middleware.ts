import { NextRequest } from "next/server";
import authConfig from "./auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req: NextRequest) {
  const publicRoutes = [
    "/",
    "/signin",
    "/register",
    "/verify",
    "/subscription",
  ];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  const session = await auth();

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

  return;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
