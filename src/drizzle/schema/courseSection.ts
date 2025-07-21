import { CourseTable } from "@/drizzle/schema/course";
import { LessonTable } from "@/drizzle/schema/lesson";
import { createdAt, id, updatedAt } from "@/drizzle/schemaHelpers";
import { relations } from "drizzle-orm";
import { integer, pgEnum, pgTable, text, uuid } from "drizzle-orm/pg-core";

export const courseSectionStatuses = ["public", "private"] as const;
export type CourseStatus = (typeof courseSectionStatuses)[number];
export const courseSectionStatusEnum = pgEnum(
  "course_section_status",
  courseSectionStatuses
);

export const CourseSectionTable = pgTable("courseSections", {
  id,
  name: text().notNull(),
  status: courseSectionStatusEnum().notNull().default("private"),
  order: integer().notNull(),
  courseId: uuid()
    .notNull()
    .references(() => CourseTable.id, { onDelete: "cascade" }),
  createdAt,
  updatedAt,
});

export const CourseSectionRelationships = relations(
  CourseSectionTable,
  ({ one, many }) => ({
    course: one(CourseTable, {
      fields: [CourseSectionTable.courseId],
      references: [CourseTable.id],
    }),
    lessons: many(LessonTable),
  })
);
