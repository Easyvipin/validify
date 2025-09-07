"use server";

import { db } from "@/db/drizzle";
import { projectVote } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq, InferSelectModel } from "drizzle-orm";

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
    where: eq(projectVote.projectId, projectId),
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
