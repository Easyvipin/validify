"use server";

import { db } from "@/db/drizzle";
import { userCategory } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const userHasCategories = async () => {
  const { userId } = await auth();
  if (!userId) return [];
  const userCategories = await db
    .select({
      categoryId: userCategory.categoryId,
    })
    .from(userCategory)
    .where(eq(userCategory.userId, userId));
  return userCategories;
};
