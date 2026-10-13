import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  varchar,
  index,
  primaryKey,
} from "drizzle-orm/pg-core";

import { defineRelations } from "drizzle-orm";
import { user } from "./auth.js";

export const classStatusEnum = pgEnum("class_status", [
  "active",
  "inactive",
  "archived",
]);

const timestamps = {
  createdAt: timestamp("created_at").defaultNow().notNull(),

  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
};

/*
|--------------------------------------------------------------------------
| Departments
|--------------------------------------------------------------------------
*/

export const departments = pgTable("departments", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  code: varchar("code", {
    length: 50,
  })
    .notNull()
    .unique(),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  description: varchar("description", {
    length: 255,
  }),

  ...timestamps,
});

/*
|--------------------------------------------------------------------------
| Subjects
|--------------------------------------------------------------------------
*/

export const subjects = pgTable("subjects", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

  departmentId: integer("department_id")
    .notNull()
    .references(() => departments.id, {
      onDelete: "restrict",
    }),

  name: varchar("name", {
    length: 255,
  }).notNull(),

  code: varchar("code", {
    length: 50,
  })
    .notNull()
    .unique(),

  description: varchar("description", {
    length: 255,
  }),

  ...timestamps,
});

/*
|--------------------------------------------------------------------------
| Classes
|--------------------------------------------------------------------------
*/

export const classes = pgTable(
  "classes",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),

    subjectId: integer("subject_id")
      .notNull()
      .references(() => subjects.id, {
        onDelete: "cascade",
      }),

    teacherId: text("teacher_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "restrict",
      }),

    inviteCode: text("invite_code").notNull().unique(),

    name: varchar("name", {
      length: 255,
    }).notNull(),

    bannerCldPubId: text("banner_cld_pub_id"),

    bannerUrl: text("banner_url"),

    description: text("description"),

    capacity: integer("capacity").default(50).notNull(),

    status: classStatusEnum("status").default("active").notNull(),

    schedules: jsonb("schedules").$type<any[]>().default([]).notNull(),

    ...timestamps,
  },
  (table) => [
    index("classes_subject_id_idx").on(table.subjectId),

    index("classes_teacher_id_idx").on(table.teacherId),
  ],
);

/*
|--------------------------------------------------------------------------
| Enrollments
|--------------------------------------------------------------------------
|
| This is the junction table between:
|
| User (student) <-> Class
|
*/

export const enrollments = pgTable(
  "enrollments",
  {
    studentId: text("student_id")
      .notNull()
      .references(() => user.id, {
        onDelete: "cascade",
      }),

    classId: integer("class_id")
      .notNull()
      .references(() => classes.id, {
        onDelete: "cascade",
      }),
  },
  (table) => [
    primaryKey({
      columns: [table.studentId, table.classId],
    }),

    unique("enrollments_student_id_class_id_unique").on(
      table.studentId,
      table.classId,
    ),

    index("enrollments_student_id_idx").on(table.studentId),

    index("enrollments_class_id_idx").on(table.classId),
  ],
);

/*
|--------------------------------------------------------------------------
| Relations
|--------------------------------------------------------------------------
|
| Department -> many Subjects
|
| Subject -> one Department
| Subject -> many Classes
|
| Class -> one Subject
| Class -> one Teacher
| Class -> many Enrollments
|
| Enrollment -> one Student
| Enrollment -> one Class
|
*/

export const classroomRelations = defineRelations(
  {
    user,
    departments,
    subjects,
    classes,
    enrollments,
  },
  (r) => ({
    /*
    |--------------------------------------------------------------------------
    | Department Relations
    |--------------------------------------------------------------------------
    */

    departments: {
      subjects: r.many.subjects(),
    },

    /*
    |--------------------------------------------------------------------------
    | Subject Relations
    |--------------------------------------------------------------------------
    */

    subjects: {
      department: r.one.departments({
        from: r.subjects.departmentId,
        to: r.departments.id,
      }),

      classes: r.many.classes(),
    },

    /*
    |--------------------------------------------------------------------------
    | Class Relations
    |--------------------------------------------------------------------------
    */

    classes: {
      subject: r.one.subjects({
        from: r.classes.subjectId,
        to: r.subjects.id,
      }),

      teacher: r.one.user({
        from: r.classes.teacherId,
        to: r.user.id,
      }),

      enrollments: r.many.enrollments(),
    },

    /*
    |--------------------------------------------------------------------------
    | Enrollment Relations
    |--------------------------------------------------------------------------
    */

    enrollments: {
      student: r.one.user({
        from: r.enrollments.studentId,
        to: r.user.id,
      }),

      class: r.one.classes({
        from: r.enrollments.classId,
        to: r.classes.id,
      }),
    },
  }),
);

/*
|--------------------------------------------------------------------------
| Types
|--------------------------------------------------------------------------
*/

export type Department = typeof departments.$inferSelect;

export type NewDepartment = typeof departments.$inferInsert;

export type Subject = typeof subjects.$inferSelect;

export type NewSubject = typeof subjects.$inferInsert;

export type Class = typeof classes.$inferSelect;

export type NewClass = typeof classes.$inferInsert;

export type Enrollment = typeof enrollments.$inferSelect;

export type NewEnrollment = typeof enrollments.$inferInsert;
