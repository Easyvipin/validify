// app/api/ensure-user-in-db/route.ts
import { db } from "@/db/drizzle";
import { user } from "@/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export async function POST() {
  const authUser = await currentUser();
  if (!authUser) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  // Check if user exists in DB
  const existing = await db
    .select()
    .from(user)
    .where(eq(user.cUserId, authUser.id));

  if (existing.length === 0) {
    await db
      .insert(user)
      .values({
        cUserId: authUser.id,
        name: authUser.fullName ?? "",
      })
      .onConflictDoNothing();
  }

  return new Response(JSON.stringify({ success: true }), { status: 200 });
}
