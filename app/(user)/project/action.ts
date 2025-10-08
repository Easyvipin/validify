"use server";

import { db } from "@/db/drizzle";
import { project } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { and, eq } from "drizzle-orm";

export const uploadScreenshotsToProject = async (
  photosUrls: string[],
  givenProjectId: number
) => {
  const { userId } = await auth();

  if (!userId) return { ok: false, message: "Please authenticate" };

  const isExist = await db.query.project.findFirst({
    where: and(eq(project.id, givenProjectId), eq(project.userId, userId)),
    columns: {
      id: true,
    },
  });

  if (isExist) {
    await db.update(project).set({
      screenshot: photosUrls,
    });

    return { ok: true, message: "Uploaded Successfully " };
  } else {
    return { ok: false, message: "Project not found" };
  }
};
