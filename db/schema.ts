import { relations } from "drizzle-orm";
import {
  text,
  pgTable,
  serial,
  timestamp,
  integer,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";

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
  score: integer("score").default(0).notNull(),
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

export const projectVote = pgTable(
  "project_vote",
  {
    projectId: integer("project_id")
      .references(() => project.id)
      .notNull(),
    userId: text("user_id")
      .references(() => user.cUserId)
      .notNull(),
    type: text("type", { enum: ["upvote", "downvote"] }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [primaryKey({ columns: [table.projectId, table.userId] })]
);

//
// 👀 Click Tracking
// For both logged-in users and guests
//
export const projectClick = pgTable("project_click", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .references(() => project.id)
    .notNull(),
  userId: text("user_id").references(() => user.cUserId),
  sessionId: text("session_id"),
  type: text("type", { enum: ["view", "link"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userNotification = pgTable(
  "user_notification",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    projectId: integer("project_id").notNull(),
    type: text("type", { enum: ["upvote", "view", "comment"] }).notNull(),
    lastReadAt: timestamp("last_read_at"),
    lastUpdated: timestamp("last_updated").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_project_type_idx").on(table.userId, table.projectId),
  ]
);

export const userNotificationHistory = pgTable("user_notification_history", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .references(() => user.cUserId, { onDelete: "cascade" })
    .notNull(),
  projectId: integer("project_id")
    .references(() => project.id, { onDelete: "cascade" })
    .notNull(),
  triggeredBy: text("triggered_by")
    .references(() => user.cUserId, { onDelete: "cascade" })
    .notNull(),
  type: text("type", { enum: ["upvote", "view", "comment"] }).notNull(),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
  votes: many(projectVote),
  clicks: many(projectClick),
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

export const projectVoteRelations = relations(projectVote, ({ one }) => ({
  project: one(project, {
    fields: [projectVote.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectVote.userId],
    references: [user.cUserId],
  }),
}));

export const projectClickRelations = relations(projectClick, ({ one }) => ({
  project: one(project, {
    fields: [projectClick.projectId],
    references: [project.id],
  }),
  user: one(user, {
    fields: [projectClick.userId],
    references: [user.cUserId],
  }),
}));
