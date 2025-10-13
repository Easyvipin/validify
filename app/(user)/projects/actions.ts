"use server";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { db } from "@/db/drizzle";
import { category, project, projectCategory } from "@/db/schema";
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
      votes: true,
    },
    where: eq(project.userId, userId),
    orderBy: desc(project.createdAt),
  });

  const projectsWithVotes = data?.map((p) => {
    const upvotes = p.votes.filter((v) => v.type === "upvote").length;
    const downvotes = p.votes.filter((v) => v.type === "downvote").length;

    return {
      ...p,
      upvotes,
      downvotes,
    };
  });

  return projectsWithVotes;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevState: any,
  formData: {
    name: string;
    desc: string;
    categoryId: string;
    url: string;
    tagline: string;
    logoUrl: string;
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Unauthorized" };
  }
  const name = formData.name as string;
  const desc = formData.desc as string;
  const url = formData.url as string;
  const tagline = formData.tagline as string;
  const logoUrl = formData.logoUrl as string;
  const categoryId = Number(formData.categoryId);

  const [newProject] = await db
    .insert(project)
    .values({
      name: name,
      desc: desc,
      userId: userId,
      url: url,
      tagline: tagline,
      logoUrl: logoUrl,
    })
    .returning({ id: project.id });

  await db.insert(projectCategory).values({
    projectId: newProject.id,
    categoryId: categoryId,
  });

  revalidatePath("/");

  return {
    ok: true,
    message: "Project created successfully!",
    newProjectId: newProject.id,
  };
}

export async function updateProject(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prevState: any,
  formData: {
    name: string;
    desc: string;
    url: string;
    tagline: string;
    logoUrl: string;
    screenshots: string[];
  }
) {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false, message: "Unauthorized" };
  }
  const name = formData.name as string;
  const desc = formData.desc as string;
  const url = formData.url as string;
  const tagline = formData.tagline as string;
  const logoUrl = formData.logoUrl as string;

  await db
    .update(project)
    .set({
      name: name,
      desc: desc,
      userId: userId,
      url: url,
      tagline: tagline,
      logoUrl: logoUrl,
      screenshot: formData.screenshots,
    })
    .returning({ id: project.id });

  revalidatePath("/");

  return {
    ok: true,
    message: "Project Updated successfully!",
  };
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
