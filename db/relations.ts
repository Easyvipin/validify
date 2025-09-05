import { relations } from "drizzle-orm";
import {
  category,
  project,
  projectCategory,
  user,
  userCategory,
} from "./schema";

export const userRelations = relations(user, ({ many }) => ({
  projects: many(project),
  userCategories: many(userCategory),
}));

// 📦 Project relations
export const projectRelations = relations(project, ({ one, many }) => ({
  user: one(user, {
    fields: [project.userId],
    references: [user.cUserId],
  }),
  projectCategories: many(projectCategory),
}));

// 🏷️ Category relations
export const categoryRelations = relations(category, ({ many }) => ({
  projectCategories: many(projectCategory),
  userCategories: many(userCategory),
}));

// 🔗 Project ↔ Category
export const projectCategoryRelations = relations(
  projectCategory,
  ({ one }) => ({
    project: one(project, {
      fields: [projectCategory.projectId],
      references: [project.id],
    }),
    category: one(category, {
      fields: [projectCategory.categoryId],
      references: [category.id],
    }),
  })
);

// 🔗 User ↔ Category
export const userCategoryRelations = relations(userCategory, ({ one }) => ({
  user: one(user, {
    fields: [userCategory.userId],
    references: [user.cUserId],
  }),
  category: one(category, {
    fields: [userCategory.categoryId],
    references: [category.id],
  }),
}));
