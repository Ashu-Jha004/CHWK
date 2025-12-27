"use client";

import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Welcome back</h2>
        <p className="text-gray-600 mt-2">
          Sign in to your account to continue
        </p>
      </div>

      <SignIn
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
        // 1. Fixed prop: redirectUrl -> fallbackRedirectUrl
        fallbackRedirectUrl="/dashboard"
        // 2. Ensure routing matches your file structure
        routing="path"
        path="/sign-in"
      />
    </div>
  );
}
