import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { projectCategory } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || "10");
  const cursor = searchParams.get("cursor"); // project.id of last item seen
  const categoriesParam = searchParams.get("categories");

  const categoryIds = categoriesParam
    ? categoriesParam.split(",").map((id) => Number(id))
    : [];

  if (categoryIds.length === 0) return NextResponse.json([]);

  // ✅ cursor pagination by project.id
  const projects = await db.query.project.findMany({
    where: (proj, { exists, and, inArray, lt }) =>
      and(
        exists(
          db
            .select({ id: projectCategory.id })
            .from(projectCategory)
            .where(
              and(
                eq(projectCategory.projectId, proj.id),
                inArray(projectCategory.categoryId, categoryIds)
              )
            )
        ),
        cursor ? lt(proj.id, Number(cursor)) : undefined // only fetch projects < cursor
      ),
    with: {
      user: true,
      projectCategories: {
        with: { category: true },
      },
      votes: true,
    },
    orderBy: (proj, { desc }) => [desc(proj.id)], // stable ordering
    limit,
  });

  const projectsWithVotes = projects.map((p) => {
    const upvotes = p.votes.filter((v) => v.type === "upvote").length;
    const downvotes = p.votes.filter((v) => v.type === "downvote").length;

    const userVote = p.votes.find((v) => v.userId === userId)?.type || null;

    return {
      ...p,
      upvotes,
      downvotes,
      userVote,
    };
  });

  return NextResponse.json(projectsWithVotes);
}
