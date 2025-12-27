import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// 1. Define Public Routes (Replaces publicRoutes array)
const isPublicRoute = createRouteMatcher([
  "/",
  "/search",
  "/businesses(.*)",
  "/categories(.*)",
  "/about",
  "/api/businesses/nearby",
  "/api/search(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
]);

// 2. Define Webhook/Ignored Routes (Replaces ignoredRoutes)
const isWebhookRoute = createRouteMatcher([
  "/api/webhooks(.*)"
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId, sessionClaims } = await auth();
  const { pathname } = req.nextUrl;

  // Allow webhooks to pass through without any auth checks
  if (isWebhookRoute(req)) {
    return NextResponse.next();
  }

  // 3. Handle Protected Routes
  // If the route isn't public and user isn't logged in, Clerk automatically redirects to sign-in
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // 4. Role-Based Access Control (RBAC)
  if (userId) {
    const userRole = (sessionClaims?.metadata as { role?: string })?.role;

    // Business owner routes protection
    if (pathname.startsWith('/business') && userRole !== 'BUSINESS_OWNER' && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Admin routes protection
    if (pathname.startsWith('/admin') && userRole !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};