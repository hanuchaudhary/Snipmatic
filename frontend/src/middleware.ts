import { auth } from "@/auth";

export default auth((req) => {
  const publicRoutes = ["/", "/signin", "/register", "/verify"];
  const isPublicRoute = publicRoutes.includes(req.nextUrl.pathname);
  
   // If user is not authenticated and trying to access protected routes, redirect to signin
  if (!req.auth && !isPublicRoute) {
    const newUrl = new URL("/signin", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }

  // If user is authenticated and on signin/register page, redirect to /clip
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
