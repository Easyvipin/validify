import { NextResponse } from "next/server";
import { and, exists, eq, inArray, lt } from "drizzle-orm";
import { project, projectCategory, userCategory } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/db/drizzle";

export async function GET(req: Request) {
  const { userId } = await auth();
  if (!userId)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get("limit") || "10");
  const cursor = searchParams.get("cursor"); // project.id of last item seen

  // get user categories
  const userCategories = await db
    .select({ categoryId: userCategory.categoryId })
    .from(userCategory)
    .where(eq(userCategory.userId, userId));

  const categoryIds = userCategories.map((uc) => uc.categoryId);
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
    },
    orderBy: (proj, { desc }) => [desc(proj.id)], // stable ordering
    limit,
  });

  return NextResponse.json(projects);
}
