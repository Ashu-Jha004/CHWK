// app/api/webhooks/clerk/route.ts
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("❌ CLERK_WEBHOOK_SECRET is missing");
    return NextResponse.json(
      { error: "Server configuration error" },
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing svix headers", { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);
  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    return new Response("Error: Verification failed", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  try {
    switch (eventType) {
      case "user.created": {
        const {
          email_addresses,
          first_name,
          last_name,
          image_url,
          phone_numbers,
          created_at,
        } = evt.data;
        await prisma.user.upsert({
          where: { id },
          update: {
            email: email_addresses[0]?.email_address,
            firstName: first_name,
            lastName: last_name,
            avatar: image_url,
          },
          create: {
            id: id!,
            email: email_addresses[0]?.email_address,
            emailVerified:
              email_addresses[0]?.verification?.status === "verified"
                ? new Date()
                : null,
            firstName: first_name,
            lastName: last_name,
            avatar: image_url,
            phone: phone_numbers[0]?.phone_number || null,
            phoneVerified:
              phone_numbers[0]?.verification?.status === "verified",
            role: "CUSTOMER", // Default role per schema [cite: 6]
            isActive: true,
            createdAt: new Date(created_at),
          },
        });
        break;
      }

      case "user.updated": {
        const {
          email_addresses,
          first_name,
          last_name,
          image_url,
          phone_numbers,
        } = evt.data;
        await prisma.user.update({
          where: { id },
          data: {
            email: email_addresses[0]?.email_address,
            firstName: first_name,
            lastName: last_name,
            avatar: image_url,
            phone: phone_numbers[0]?.phone_number || null,
            phoneVerified:
              phone_numbers[0]?.verification?.status === "verified",
          },
        });
        break;
      }

      case "user.deleted": {
        // Soft delete implementation to preserve referential integrity for orders/bookings [cite: 13, 112, 136]
        await prisma.user.update({
          where: { id },
          data: {
            isActive: false,
          },
        });
        break;
      }
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error(`❌ Webhook Processing Error:`, error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
