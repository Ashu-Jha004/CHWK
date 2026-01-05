import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

/* =====================================================
   ROUTE MATCHERS
===================================================== */

// Public (SEO + unauthenticated) routes
const isPublicRoute = createRouteMatcher([
  "/",                         // Home
  "/search(.*)",               // Search page
  "/businesses(.*)",           // Business directory
  "/business_service(.*)",     // Public business details
  "/categories(.*)",           // Categories page
  "/about",                    // Static pages
  "/how-it-works",
  "/testimonials",
  "/contact",

  // Auth pages
  "/sign-in(.*)",
  "/sign-up(.*)",

  // Public APIs
  "/api/businesses/nearby",
  "/api/location(.*)",
  "/api/search(.*)",
  "/api/reviews/list(.*)",
  "/api/categories(.*)",
  "/api/category(.*)",
  "/api/reviews/vote(.*)",
  "/api/webhooks(.*)", // Webhooks often need to be public/bypassed

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

const isOnboardingRoute = createRouteMatcher([
  "/onboarding",
]);

/* =====================================================
   MIDDLEWARE
==================================================== */

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims, redirectToSignIn } = await auth();
  const { pathname } = req.nextUrl;

  /* =====================================================
     1️⃣ ABSOLUTE BYPASS (SEO CRITICAL)
  ===================================================== */
  if (
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname === "/site.webmanifest" ||
    pathname === "/sw.js"
  ) {
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
  // Ensure business dashboard is NOT treated as public just because of a wildcard overlap
  const isDashboardRoute = pathname.startsWith("/business/dashboard") || pathname.startsWith("/business/onboarding");

  if (isPublicRoute(req) && !isDashboardRoute) {
    return NextResponse.next();
  }

  /* =====================================================
     4️⃣ PRIVATE ROUTES → REQUIRE AUTH
  ===================================================== */
  if (!userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  /* =====================================================
     5️⃣ ONBOARDING ENFORCEMENT
  ===================================================== */
  const onboardingComplete = (sessionClaims?.metadata as { onboardingComplete?: boolean })?.onboardingComplete;

  // If business owner and onboarding incomplete, force to onboarding
  // We can check role or just if they are trying to access dashboard
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const isBusinessOwner = role === "BUSINESS_OWNER";

  if (isBusinessOwner && !onboardingComplete && !pathname.startsWith("/business/onboarding") && !pathname.startsWith("/api")) {
     return NextResponse.redirect(new URL("/business/onboarding", req.url));
  }

  /* =====================================================
     6️⃣ ROLE-BASED ACCESS CONTROL (RBAC)
  ===================================================== */
  // Protect Business Dashboard
  if (pathname.startsWith("/business/dashboard")) {
    if (role !== "BUSINESS_OWNER" && role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  // Protect Admin Dashboard
  if (pathname.startsWith("/admin")) {
    if (role !== "ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
});

/* =====================================================
   MATCHER CONFIG
===================================================== */

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
