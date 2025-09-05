"use server";

import { db } from "@/db/drizzle";
import { category, user, userCategory } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";

export const getAllCategories = async () => {
  const categories = await db
    .select({
      id: category.id,
      name: category.name,
    })
    .from(category);

  return categories;
};

export const completeOnboarding = async (
  prevState: { ok: boolean; message: string },
  values: {
    name: string;
    bio: string;
    profession: string;
    categories: number[];
  }
) => {
  try {
    console.log("geadsd");
    const { userId } = await auth();
    if (!userId) {
      return { ok: false, message: "Unauthorized" };
    }
    const { name, bio, profession, categories } = values;

    await db
      .update(user)
      .set({
        name: name,
        bio: bio,
        profession: profession,
      })
      .where(eq(user.cUserId, userId));

    await db.delete(userCategory).where(eq(userCategory.userId, userId));

    await db.insert(userCategory).values(
      categories.map((catId) => ({
        userId,
        categoryId: catId,
      }))
    );

    return { ok: true, message: "Onboarding completed successfully" };
  } catch (err) {
    console.log(err);
    return { ok: false, message: "Lets try again :(" };
  }
};
