import { NextRequest, NextResponse } from "next/server";
import authConfig from "./auth.config";
import NextAuth from "next-auth";

const { auth } = NextAuth(authConfig);

export default auth(async function middleware(req) {
  const publicRoutes = [
    "/",
    "/signin",
    "/register",
    "/verify",
    "/subscription",
  ];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  if (!req.auth && !isPublicRoute) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  if (
    req.auth &&
    (req.nextUrl.pathname === "/signin" || req.nextUrl.pathname === "/register")
  ) {
    const newUrl = new URL("/clip", req.nextUrl.origin);
    return NextResponse.redirect(newUrl);
  }

  return;
});

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|icon.png|.*\\.png|.*\\.jpg|.*\\.jpeg|.*\\.gif|.*\\.svg).*)",
  ],
};
