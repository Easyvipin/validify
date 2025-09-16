/* "use server";

import { db } from "@/db/drizzle";
import { userNotification, userNotificationHistory } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq, and, gt } from "drizzle-orm";

// 1️⃣ Create a notification (called from vote/comment)
export async function createNotification({
  ownerId, // project owner
  projectId,
  triggeredBy, // user who caused the event
  type, // "upvote", "downvote", "view", "comment"
}: {
  ownerId: string;
  projectId: number;
  triggeredBy: string;
  type: "upvote" | "view" | "comment";
}) {
  // a) insert immutable history
  await db.insert(userNotificationHistory).values({
    userId: ownerId,
    projectId,
    triggeredBy,
    type,
    createdAt: new Date(),
  });

  // b) upsert summary row
  await db
    .insert(userNotification)
    .values({
      userId: ownerId,
      projectId,
      type,
      lastUpdated: new Date(),
    })
    .onConflictDoUpdate({
      target: [userNotification.userId, userNotification.projectId], // one row per project per user
      set: {
        type, // overwrite previous type (handles upvote -> downvote)
        lastUpdated: new Date(),
      },
    });
}

// 2️⃣ Fetch notifications (summary + unread count), sorted by recent activity
export async function getNotifications() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not logged in");

  // fetch all channels for user
  const channels = await db
    .select()
    .from(userNotification)
    .where(eq(userNotification.userId, userId))
    .orderBy(userNotification.lastUpdated, "desc");

  // compute unread count for each channel
  const enriched = await Promise.all(
    channels.map(async (ch) => {
      const lastReadAt = ch.lastReadAt ?? new Date(0);

      const [res] = await db
        .select({ count: db.sql<number>`count(*)` })
        .from(userNotificationHistory)
        .where(
          and(
            eq(userNotificationHistory.userId, ch.userId),
            eq(userNotificationHistory.projectId, ch.projectId),
            gt(userNotificationHistory.createdAt, lastReadAt)
          )
        );

      return {
        ...ch,
        unreadCount: Number(res?.count ?? 0),
      };
    })
  );

  return enriched;
}

// 3️⃣ Mark a project as read
export async function markNotificationRead(projectId: number) {
  const { userId } = auth();
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
 */
