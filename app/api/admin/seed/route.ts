import type { NextRequest } from "next/server";
import { createApiResponse, handleApiError } from "@/lib/api-utils";
import { adminAuthMiddleware } from "@/lib/admin-auth";
import { seedDatabase } from "@/prisma/seed";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Check admin authorization
  const authResponse = await adminAuthMiddleware(req);
  if (authResponse.status !== 200) {
    return authResponse;
  }

  try {
    await seedDatabase();
    return createApiResponse({
      data: { message: "Database seeded successfully" },
      status: 200,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
