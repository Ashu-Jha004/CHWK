"use client";

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  // Removing the manual 'mounted' state check as modern Clerk components
  // handle hydration internally without causing layout flickers.

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Create an account</h2>
        <p className="text-gray-600 mt-2">Get started with CHWK today</p>
      </div>

      <SignUp
        appearance={{
          elements: {
            rootBox: "w-full",
            card: "shadow-none border-0 p-0",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            socialButtonsBlockButton:
              "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700",
            formButtonPrimary:
              "bg-primary hover:bg-primary/90 text-white normal-case",
            footerActionLink: "text-primary hover:text-primary/80",
            formFieldInput:
              "rounded-lg border-gray-300 focus:border-primary focus:ring-primary",
            identityPreviewEditButton: "text-primary hover:text-primary/80",
          },
        }}
        // FIX: redirectUrl is deprecated. Use fallbackRedirectUrl or forceRedirectUrl.
        fallbackRedirectUrl="/dashboard"
        routing="path"
        path="/sign-up"
      />
    </div>
  );
}
