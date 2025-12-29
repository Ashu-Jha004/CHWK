// app/business/dashboard/debug/page.tsx
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function DebugPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Check user in database
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedBusinesses: {
        where: { deletedAt: null },
      },
    },
  });

  // Check all businesses for this owner
  const allBusinesses = await prisma.business.findMany({
    where: {
      ownerId: userId,
    },
  });

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Debug Information</h1>

      <div className="space-y-6">
        {/* Clerk User ID */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Clerk User ID</h2>
          <p className="font-mono text-sm">{userId}</p>
        </div>

        {/* Database User */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Database User</h2>
          {user ? (
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify(
                {
                  id: user.id,
                  email: user.email,
                  role: user.role,
                  firstName: user.firstName,
                  lastName: user.lastName,
                  ownedBusinessesCount: user.ownedBusinesses?.length || 0,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <p className="text-destructive">User not found in database!</p>
          )}
        </div>

        {/* Owned Businesses (from include) */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">
            Owned Businesses (from user.ownedBusinesses)
          </h2>
          {user?.ownedBusinesses && user.ownedBusinesses.length > 0 ? (
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify(user.ownedBusinesses, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground">
              No businesses found via include
            </p>
          )}
        </div>

        {/* All Businesses (direct query) */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">
            All Businesses (direct query)
          </h2>
          {allBusinesses && allBusinesses.length > 0 ? (
            <pre className="bg-muted p-4 rounded text-xs overflow-auto">
              {JSON.stringify(allBusinesses, null, 2)}
            </pre>
          ) : (
            <p className="text-muted-foreground">
              No businesses found via direct query
            </p>
          )}
        </div>

        {/* User Role Check */}
        <div className="glass rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-2">Role Check</h2>
          <p>
            Current Role: <strong>{user?.role || "N/A"}</strong>
          </p>
          <p>
            Is BUSINESS_OWNER:{" "}
            <strong
              className={
                user?.role === "BUSINESS_OWNER"
                  ? "text-green-500"
                  : "text-red-500"
              }
            >
              {user?.role === "BUSINESS_OWNER" ? "YES" : "NO"}
            </strong>
          </p>
        </div>
      </div>
    </div>
  );
}
