import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { project } from "@/db/schema";
import { eq } from "drizzle-orm";

function calculateScore({
  upvotes,
  downvotes,
  views,
  clicks,
  createdAt,
}: {
  upvotes: number;
  downvotes: number;
  views: number;
  clicks: number;
  createdAt: Date;
}) {
  const base =
    upvotes * 3 + clicks * 2 + Math.floor(views * 0.5) - downvotes * 2;

  const hoursSince = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60);
  const ageFactor = Math.pow(hoursSince + 2, 1.5);

  return Math.floor(base / ageFactor);
}

export async function POST(req: NextRequest) {
  if (
    req.headers.get("Authorization") !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  try {
    const projects = await db.query.project.findMany({
      with: {
        votes: true,
        clicks: true,
      },
    });

    for (const p of projects) {
      const upvotes = p.votes.filter((v) => v.type === "upvote").length;
      const downvotes = p.votes.filter((v) => v.type === "downvote").length;

      const views = p.clicks.filter((c) => c.type === "view").length;
      const clicks = p.clicks.filter((c) => c.type === "link").length;

      const score = calculateScore({
        upvotes,
        downvotes,
        views,
        clicks,
        createdAt: p.createdAt,
      });

      await db.update(project).set({ score }).where(eq(project.id, p.id));
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Failed to recalc scores" },
      { status: 500 }
    );
  }
}
