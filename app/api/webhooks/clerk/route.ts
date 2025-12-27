/* eslint-disable @typescript-eslint/no-explicit-any */
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  // 1. Clerk Webhook Secret
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env"
    );
  }

  // 2. Get headers (Async in Next.js 15/16)
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If no headers, return error
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  // 3. Get the body as text for verification
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  // 4. Verify webhook
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("❌ Webhook verification failed:", err);
    return new Response("Error: Verification failed", { status: 400 });
  }

  const eventType = evt.type;
  console.log(`📩 Webhook received: ${eventType}`);

  try {
    switch (eventType) {
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      default:
        console.log(`ℹ️ Unhandled event type: ${eventType}`);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`❌ Error processing ${eventType}:`, error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleUserCreated(data: any) {
  const {
    id,
    email_addresses,
    first_name,
    last_name,
    image_url,
    phone_numbers,
    created_at,
  } = data;

  await prisma.user.upsert({
    where: { id },
    update: {
      email: email_addresses[0]?.email_address || "",
      firstName: first_name || null,
      lastName: last_name || null,
      avatar: image_url || null,
    },
    create: {
      id,
      email: email_addresses[0]?.email_address || "",
      emailVerified:
        email_addresses[0]?.verification?.status === "verified"
          ? new Date()
          : null,
      firstName: first_name || null,
      lastName: last_name || null,
      avatar: image_url || null,
      phone: phone_numbers[0]?.phone_number || null,
      phoneVerified: phone_numbers[0]?.verification?.status === "verified",
      role: "CUSTOMER",
      isActive: true,
      createdAt: new Date(created_at),
    },
  });
}

async function handleUserUpdated(data: any) {
  const {
    id,
    email_addresses,
    first_name,
    last_name,
    image_url,
    phone_numbers,
  } = data;

  await prisma.user.update({
    where: { id },
    data: {
      email: email_addresses[0]?.email_address || "",
      firstName: first_name || null,
      lastName: last_name || null,
      avatar: image_url || null,
      phone: phone_numbers[0]?.phone_number || null,
      phoneVerified: phone_numbers[0]?.verification?.status === "verified",
    },
  });
}

async function handleUserDeleted(data: any) {
  const { id } = data;
  // Use upsert or update to handle soft delete securely
  await prisma.user.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  });
}
