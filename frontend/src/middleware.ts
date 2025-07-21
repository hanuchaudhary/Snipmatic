import { auth } from "@/auth";

export default auth((req) => {
  const publicRoutes = ["/", "/signin", "/register", "/verify", "/pricing"];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);

  if (!req.auth && !isPublicRoute) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  if (
    req.auth &&
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
