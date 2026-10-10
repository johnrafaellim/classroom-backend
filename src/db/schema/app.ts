import { pgTable } from "drizzle-orm/pg-core/table";
import { integer, timestamp, varchar } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm/_relations";

// Reusable timestamp columns for created_at and updated_at
const timestamps = {
    createdAt: timestamp("created_at")
        .defaultNow()
        .notNull(),

    updatedAt: timestamp("updated_at")
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
};

// It says: "Create a departments table"
export const departments = pgTable("departments", {
    // It says: "Each Department has a unique auto-generated ID"
    id: integer("id")
        .primaryKey()
        .generatedAlwaysAsIdentity(),

    // It says: "Each Department must have a unique code"
    code: varchar("code", { length: 50 })
        .notNull()
        .unique(),

    // It says: "Each Department must have a name"
    name: varchar("name", { length: 255 })
        .notNull(),

    // It says: "A Department can optionally have a description"
    description: varchar("description", { length: 255 }),

    // It says: "Add created_at and updated_at columns"
    ...timestamps,
});

// It says: "Create a subjects table"
export const subjects = pgTable("subjects", {
    // It says: "Each Subject has a unique auto-generated ID"
    id: integer("id")
        .primaryKey()
        .generatedAlwaysAsIdentity(),

    // It says: "Each Subject must belong to a Department"
    departmentId: integer("department_id")
        .notNull()
        .references(() => departments.id, {
            onDelete: "restrict",
        }),

    // It says: "Each Subject must have a name"
    name: varchar("name", { length: 255 })
        .notNull(),

    // It says: "Each Subject must have a unique code"
    code: varchar("code", { length: 50 })
        .notNull()
        .unique(),

    // It says: "A Subject can optionally have a description"
    description: varchar("description", { length: 255 }),

    // It says: "Add created_at and updated_at columns"
    ...timestamps,
});

// It says: "One Department can have many Subjects"
export const departmentRelations = relations(
    departments,
    ({ many }) => ({
        subjects: many(subjects),
    })
);

// It says: "Each Subject belongs to one Department"
export const subjectRelation = relations(
    subjects,
    ({ one, many }) => ({
        department: one(departments, {
            fields: [subjects.departmentId],
            references: [departments.id],
        }),
    })
);

// It says: "Create a TypeScript type based on a Department record returned from the database"
// $inferSelect - “What does a full row look like when I read it from the database?”
export type Department = typeof departments.$inferSelect;

// It says: "Create a TypeScript type for inserting a new Department"
// $inferInsert - “What data can I provide when creating a new row?”
export type NewDepartment = typeof departments.$inferInsert;

/**
 * Think of it as
 *
 * Department
 *    → data coming OUT of the database
 * NewDepartment
 *    → data going INTO the database
 */

export type Subject = typeof subjects.$inferSelect;
export type NewSubject = typeof subjects.$inferInsert;

