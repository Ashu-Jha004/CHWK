import Image from "next/image";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side: Form Container */}
      <main className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:flex-none lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          {/* Shared Logo or Header */}
          <div className="mb-10">
            <Image src={"/logo.png"} alt="Logo" width={100} height={100} />
            <h1 className="text-2xl font-bold tracking-tight text-gray-900">
              CHWK
            </h1>
          </div>

          {/* This is where login/signup pages will render */}
          {children}
        </div>
      </main>

      {/* Right Side: Visual/Marketing Column (Hidden on mobile) */}
    </div>
  );
}
