import React from "react";
import Link from "next/link";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* 1. Sidebar - Fixed on desktop */}

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Header */}

        {/* Page Content */}
        <main className="p-8">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>
      </div>
    </div>
  );
}
