import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/* =====================================================
   ROUTE MATCHERS
===================================================== */

// Public (SEO + unauthenticated) routes
const isPublicRoute = createRouteMatcher([
  "/",                         // Home
  "/search",
  "/businesses(.*)",
  "/business_service(.*)",     // SEO business pages
  "/categories(.*)",
  "/business(.*)",
  "/about",

  // Auth pages
  "/sign-in(.*)",
  "/sign-up(.*)",
  // Public APIs
  "/api/businesses/nearby",
  "/api/location/(.*)",
  "/api/search(.*)",
  "/api/reviews/list(.*)",
  "/api/categories(.*)",
  "/api/category(.*)",
  "/api/reviews/vote(.*)",

  // SEO and PWA files
  "/sitemap.xml",
  "/robots.txt",
  "/site.webmanifest",
  "/sw.js",
]);

// Webhooks must bypass ALL auth logic
const isWebhookRoute = createRouteMatcher([
  "/api/webhooks(.*)",
]);

// Onboarding flow
const isOnboardingRoute = createRouteMatcher([
  "/onboarding",
]);

/* =====================================================
   MIDDLEWARE
==================================================== */

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, isAuthenticated, redirectToSignIn } =
    await auth();

  const { pathname } = req.nextUrl;

  /* =====================================================
     1️⃣ ABSOLUTE BYPASS (SEO CRITICAL)
     robots.txt & sitemap.xml must NEVER redirect
  ===================================================== */
  if (pathname === "/robots.txt" || pathname === "/sitemap.xml" || pathname === "/site.webmanifest" || pathname === "/sw.js") {
    return NextResponse.next();
  }

  /* =====================================================
     2️⃣ WEBHOOKS (NO AUTH / NO REDIRECTS)
  ===================================================== */
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  /* =====================================================
     3️⃣ PUBLIC ROUTES (NO AUTH REQUIRED)
  ===================================================== */
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  /* =====================================================
     4️⃣ PRIVATE ROUTES → REQUIRE AUTH
  ===================================================== */
  if (!isAuthenticated) {
    return redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  /* =====================================================
     5️⃣ ONBOARDING ENFORCEMENT (PRIVATE ONLY)
  ===================================================== */
  const onboardingComplete =
    (sessionClaims?.metadata as { onboardingComplete?: boolean })
      ?.onboardingComplete;

  if (
    isAuthenticated &&
    !onboardingComplete &&
    !isOnboardingRoute(req)
  ) {
    return NextResponse.redirect(new URL("/onboarding", req.url));
  }

  /* =====================================================
     6️⃣ ROLE-BASED ACCESS CONTROL (RBAC)
  ===================================================== */
  if (userId) {
    const role =
      (sessionClaims?.metadata as { role?: string })?.role ?? "USER";

    // Business owner routes (exclude public business_service pages)
    if (
      pathname.startsWith("/business/") &&
      !pathname.startsWith("/business_service") &&
      role !== "BUSINESS_OWNER" &&
      role !== "ADMIN"
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Admin-only routes
    if (pathname.startsWith("/admin") && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  /* =====================================================
     7️⃣ ALLOW REQUEST
  ===================================================== */
  return NextResponse.next();
});

/* =====================================================
   MATCHER CONFIG
===================================================== */

export const config = {
  matcher: [
    // All routes except static assets
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|js|webmanifest)$).*)",

    // APIs
    "/(api|trpc)(.*)",

    // SEO and PWA files
    "/sitemap.xml",
    "/robots.txt",
    "/site.webmanifest",
    "/sw.js",
  ],
};
