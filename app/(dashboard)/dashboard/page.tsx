// src/app/(dashboard)/dashboard/page.tsx

import { UserButton } from "@/components/auth/user-button";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  // Use Clerk's currentUser instead of database
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }
  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-4">Protected Dashboard</h1>

      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
        <p className="font-bold">✅ Authentication Working!</p>
        <UserButton />
        <p className="text-sm mt-1">(Using Clerk only, no database yet)</p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 max-w-2xl">
        <h2 className="text-xl font-semibold mb-4">User Information</h2>

        <div className="space-y-3">
          <div>
            <label className="text-gray-600 text-sm">User ID:</label>
            <p className="font-mono text-sm">{user.id}</p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Email:</label>
            <p>{user.emailAddresses[0]?.emailAddress}</p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Name:</label>
            <p>
              {user.firstName} {user.lastName}
            </p>
          </div>

          <div>
            <label className="text-gray-600 text-sm">Created At:</label>
            <p>{new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
