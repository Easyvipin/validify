"use server";

import { db } from "@/db/drizzle";
import { projectClick, projectVote, userCategory } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, InferSelectModel, sql } from "drizzle-orm";
import { redirect } from "next/navigation";

type ProjectVote = InferSelectModel<typeof projectVote>;
type ProjectClick = InferSelectModel<typeof projectClick>;

export type VoteType = ProjectVote["type"];
export type click = ProjectClick["type"];

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

export const insertClick = async (
  projectId: ProjectClick["projectId"],
  type: click
) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const [{ clickCount }] = await db
    .select({ clickCount: sql<number>`count(*)` })
    .from(projectClick)
    .where(
      and(
        eq(projectClick.projectId, projectId),
        eq(projectClick.userId, userId),
        eq(projectClick.type, type)
      )
    );

  if (Number(clickCount) !== 1) {
    await db.insert(projectClick).values({
      projectId: projectId,
      userId: userId,
      type: type,
    });
  } else {
    return;
  }
};
