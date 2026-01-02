"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

export async function getBusinessStatus() {
  const { userId } = await auth();

  if (!userId) {
    return { isBusinessOwner: false, business: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      ownedBusinesses: {
        where: { deletedAt: null },
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!user) {
    return { isBusinessOwner: false, business: null };
  }

  const isBusinessOwner = user.role === "BUSINESS_OWNER" || user.ownedBusinesses.length > 0;
  const business = user.ownedBusinesses[0] || null;

  return {
    isBusinessOwner,
    business,
    role: user.role,
  };
}
