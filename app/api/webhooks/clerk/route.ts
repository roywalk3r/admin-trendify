import { Webhook } from "svix"
import { headers } from "next/headers"
import type { WebhookEvent } from "@clerk/nextjs/server"
import prisma from "@/lib/prisma"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_WEBHOOK_SECRET

  if (!SIGNING_SECRET) {
    throw new Error("Error: Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard to .env")
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET)

  // Get headers
  const headerPayload = await headers()
  const svix_id = headerPayload.get("svix-id")
  const svix_timestamp = headerPayload.get("svix-timestamp")
  const svix_signature = headerPayload.get("svix-signature")

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", { status: 400 })
  }

  // Get raw body for verification
  const body = await req.text()

  let evt: WebhookEvent

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent
  } catch (err) {
    console.error("Error: Could not verify webhook:", err)
    return new Response("Error: Verification error", { status: 400 })
  }

  // Use the verified event object from Svix

  if (evt.type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses?.[0]?.email_address || ""
    const fullName = `${first_name} ${last_name}` || ""
    try {
      // Idempotent upsert by Clerk ID, keep internal primary key stable
      await prisma.user.upsert({
        where: { clerkId: id },
        update: { email, name: fullName || "" },
        create: {
          clerkId: id,
          email,
          name: fullName || "",
        },
      })

      console.log(`User updated: ${email}`)
    } catch (error) {
      console.error("Database update error:", error)
      return new Response("Error saving user", { status: 500 })
    }
  }
  // Process the user registration event
  if (evt.type === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data
    const email = email_addresses?.[0]?.email_address || ""
    const fullName = `${first_name} ${last_name}` || ""

    try {
      // Idempotent create by Clerk ID; do not overwrite primary key
      await prisma.user.upsert({
        where: { clerkId: id },
        update: { email, name: fullName || "" },
        create: {
          clerkId: id,
          email,
          name: fullName || "",
        },
      })

      console.log(`New user added: ${email}`)
    } catch (error) {
      console.error("Database insert error:", error)
      return new Response("Error saving user", { status: 500 })
    }
  }

  return new Response("Webhook received", { status: 200 })
}
