import type { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { adminAuthMiddleware } from "@/lib/admin-auth"

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await adminAuthMiddleware(req)
  if (auth.status !== 200) return auth
  const id = params.id
  const body = await req.json().catch(() => ({}))
  const data: any = {}
  if (typeof body.name === "string") data.name = body.name.trim()
  if (typeof body.address === "string") data.address = body.address.trim()
  if (typeof body.isActive === "boolean") data.isActive = body.isActive
  if (Object.keys(data).length === 0) return Response.json({ error: "No valid fields" }, { status: 400 })
  const updated = await prisma.pickupLocation.update({ where: { id }, data })
  return Response.json({ data: { id: updated.id, name: updated.name, address: updated.address, isActive: updated.isActive } })
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const auth = await adminAuthMiddleware(req)
  if (auth.status !== 200) return auth
  const id = params.id
  await prisma.pickupLocation.delete({ where: { id } })
  return Response.json({ success: true })
}
