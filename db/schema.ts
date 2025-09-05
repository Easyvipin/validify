import { relations } from "drizzle-orm";
import { text, pgTable, serial, timestamp, integer } from "drizzle-orm/pg-core";

export const project = pgTable("project", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  desc: text("desc").notNull(),
  logoUrl: text("logoUrl"),
  url: text("url"),
  userId: text("user_id").references(() => user.cUserId, {
    onDelete: "cascade",
    onUpdate: "cascade",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const user = pgTable("user", {
  cUserId: text("clerk_user_id").primaryKey(),
  name: text("name"),
  profession: text("profession"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const category = pgTable("category", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userCategory = pgTable("user_category", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.cUserId)
    .notNull(),
  categoryId: integer("category_id")
    .references(() => category.id)
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const projectCategory = pgTable("project_category", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => project.id)
    .notNull(),
  categoryId: integer("category_id")
    .references(() => category.id)
    .notNull(),
});

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
