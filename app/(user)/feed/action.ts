"use server";

import { db } from "@/db/drizzle";
import { projectVote, userCategory } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, InferSelectModel } from "drizzle-orm";
import { redirect } from "next/navigation";

type ProjectVote = InferSelectModel<typeof projectVote>;

export type VoteType = ProjectVote["type"];

export const insertVote = async (
  projectId: number,
  type: "upvote" | "downvote"
) => {
  const { userId } = await auth();

  if (!userId) {
    return;
  }

  const existingVote = await db.query.projectVote.findFirst({
    where: and(
      eq(projectVote.projectId, projectId),
      eq(projectVote.userId, userId)
    ),
  });

  if (existingVote) {
    if (existingVote.type === type) {
      // clicked same vote again → remove it
      await db
        .delete(projectVote)
        .where(
          and(
            eq(projectVote.projectId, projectId),
            eq(projectVote.userId, userId)
          )
        );
    } else {
      // switch vote → update record
      await db
        .update(projectVote)
        .set({ type })
        .where(
          and(
            eq(projectVote.projectId, projectId),
            eq(projectVote.userId, userId)
          )
        );
    }
  } else {
    // no previous vote → insert new vote
    await db.insert(projectVote).values({
      projectId,
      userId,
      type,
    });
  }
};

export const subscribedCategoryIds = async () => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const categories = await db.query.userCategory.findMany({
    with: {
      category: true,
    },
    where: eq(userCategory.userId, userId),
  });

  if (categories.length > 0) {
    return categories.map((cat) => cat.categoryId);
  } else {
    redirect("/onboarding");
  }
};
