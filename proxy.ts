import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Only sign-in/sign-up are public. Everything else — including "/" — is
// protected by default. This is the inverse of an allow-list of protected
// routes: with an allow-list it's easy to forget a route (like "/") and
// accidentally leave it unauthenticated, which is what caused the
// redirect confusion here. Deny-by-default is safer for an admin app.
const isPublicRoute = createRouteMatcher(["/sign-in(.*)", "/sign-up(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
    // Always run for Clerk-specific frontend API routes
    "/__clerk/(.*)",
  ],
};