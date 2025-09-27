"use server";

import { db } from "@/db/drizzle";
import {
  project,
  userNotification,
  userNotificationHistory,
} from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, gt, desc, sql, lt } from "drizzle-orm";

// 1️⃣ Create a notification (called from vote/comment)
export async function createNotification({
  projectId,
  triggeredBy,
  type,
}: {
  projectId: number;
  triggeredBy: string;
  type: "upvote" | "view";
}) {
  const [p] = await db
    .select({ userId: project.userId, name: project.name })
    .from(project)
    .where(eq(project.id, projectId));

  if (p.userId) {
    await db.insert(userNotificationHistory).values({
      userId: p.userId,
      projectId,
      projectName: p.name,
      triggeredBy,
      type,
      createdAt: new Date(),
    });

    await db
      .insert(userNotification)
      .values({
        userId: p.userId,
        projectId,
        type,
        lastUpdated: new Date(),
      })
      .onConflictDoUpdate({
        target: [userNotification.userId, userNotification.projectId], // one row per project per user
        set: {
          type,
          lastUpdated: new Date(),
        },
      });
  } else {
  }
}

// 2️⃣ Fetch notifications (summary + unread count), sorted by recent activity
export async function getNotificationsCount() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  // fetch all channels for user (summary rows)
  const channels = await db
    .select()
    .from(userNotification)
    .where(eq(userNotification.userId, userId))
    .orderBy(desc(userNotification.lastUpdated));

  // enrich with unread breakdowns
  const enriched = await Promise.all(
    channels.map(async (ch) => {
      const lastReadAt = ch.lastReadAt ?? new Date(0);

      // group unread notifications by type
      const rows = await db
        .select({
          type: userNotificationHistory.type,
          count: sql<number>`count(*)`,
          projectName: sql<string>`MAX("project_name")`,
        })
        .from(userNotificationHistory)
        .where(
          and(
            eq(userNotificationHistory.userId, ch.userId),
            eq(userNotificationHistory.projectId, ch.projectId),
            gt(userNotificationHistory.createdAt, lastReadAt)
          )
        )
        .groupBy(userNotificationHistory.type);

      return {
        ...ch,
        unreadCount: rows.reduce((sum, r) => sum + Number(r.count), 0),
        unreadBreakdown: rows.map((r) => ({
          type: r.type,
          count: Number(r.count),
        })),
        projectName: rows[0].projectName,
      };
    })
  );

  const totalUnreadCount = enriched.reduce(
    (sum, ch) => sum + ch.unreadCount,
    0
  );

  return totalUnreadCount;
}

export async function getListOfNotifications() {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Not authorized");
  }

  const rows = await db
    .select({
      projectId: userNotificationHistory.projectId,
      type: userNotificationHistory.type,
      count: sql<number>`count(*)`,
      projectName: sql<string>`MAX("project_name")`,
      latestCreatedAt: sql<Date>`MAX(${userNotificationHistory.createdAt})`,
    })
    .from(userNotificationHistory)
    .where(and(eq(userNotificationHistory.userId, userId)))
    .groupBy(userNotificationHistory.type, userNotificationHistory.projectId)
    .orderBy(desc(sql`MAX(${userNotificationHistory.createdAt})`));

  return rows;
}

export async function markNotificationRead(projectId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  await db
    .update(userNotification)
    .set({ lastReadAt: new Date() })
    .where(
      and(
        eq(userNotification.userId, userId),
        eq(userNotification.projectId, projectId)
      )
    );
}

export async function removeUpvoteNotification(
  projectId: number,
  triggeredBy: string
) {
  const [proj] = await db
    .select({ userId: project.userId })
    .from(project)
    .where(eq(project.id, projectId));

  if (!proj?.userId) {
    throw new Error("Invalid Project");
  }

  await db
    .delete(userNotificationHistory)
    .where(
      and(
        eq(userNotificationHistory.userId, proj.userId),
        eq(userNotificationHistory.projectId, projectId),
        eq(userNotificationHistory.triggeredBy, triggeredBy),
        eq(userNotificationHistory.type, "upvote")
      )
    );

  const remaining = await db
    .select({ count: sql<number>`count(*)` })
    .from(userNotificationHistory)
    .where(
      and(
        eq(userNotificationHistory.userId, proj.userId),
        eq(userNotificationHistory.projectId, projectId),
        eq(userNotificationHistory.type, "upvote")
      )
    );

  if (Number(remaining[0]?.count ?? 0) === 0) {
    await db
      .delete(userNotification)
      .where(
        and(
          eq(userNotification.userId, proj.userId),
          eq(userNotification.projectId, projectId)
        )
      );
  }
}
