import { db } from "@/db/drizzle";
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
  });
  return data;
};
