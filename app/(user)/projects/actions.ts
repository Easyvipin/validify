"use server";
import { eq, not } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { category, project, projectCategory, user } from "@/db/schema";
import { auth } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export const getProjects = async () => {
  const { userId } = await auth();
  if (!userId) notFound();

  const data = await db.query.project.findMany({
    with: {
      projectCategories: {
        with: {
          category: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    where: eq(project.userId, userId),
  });
  return data;
};

/* export const createProject = async (payload: typeof project.$inferInsert) => {
  const { userId } = await auth();
  if (!userId) return { ok: false, reason: "unauthorized" };
  await db.insert(project).values({
    name: payload.name,
    desc: payload.desc,
    userId: userId,
  });
  revalidatePath("/");
  return { ok: true };
}; */

export async function createProject(
  prevState: any,
  formData: {
    name: string;
    desc: string;
    categoryId: string;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Unauthorized" };
  }

  const name = formData.name as string;
  const desc = formData.desc as string;
  const categoryId = Number(formData.categoryId);

  const [newProject] = await db
    .insert(project)
    .values({
      name: name,
      desc: desc,
      userId: userId,
    })
    .returning({ id: project.id });

  await db.insert(projectCategory).values({
    projectId: newProject.id,
    categoryId: categoryId,
  });

  revalidatePath("/");

  return { ok: true, message: "Project created successfully!" };
}

export const getAllCategories = async () => {
  const categories = await db
    .select({
      id: category.id,
      name: category.name,
    })
    .from(category);

  return categories;
};
