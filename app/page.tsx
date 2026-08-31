import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

/**
 * "/" has no content of its own — it's just a router.
 *
 * Unauthenticated -> /sign-in
 * Authenticated   -> /users (the actual admin landing page)
 *
 * IMPORTANT: authenticated visitors must NOT be redirected back to
 * /sign-in. Clerk's <SignIn /> already redirects an already-signed-in
 * visitor away from /sign-in (back toward "/" by default) — if this page
 * also sent authenticated users to /sign-in, the two redirects would loop
 * forever: "/" -> "/sign-in" -> (already signed in) -> "/" -> "/sign-in" -> ...
 *
 * The middleware (see middleware.ts) already protects "/" via
 * auth.protect(), so in practice an unauthenticated request never reaches
 * this component at all — it's redirected to /sign-in at the middleware
 * layer first. The `if (!userId)` check below is just defense-in-depth in
 * case the matcher config ever changes.
 */
export default async function RootPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  redirect("/users");
}