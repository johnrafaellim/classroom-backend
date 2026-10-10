import express from "express";
import { and, count, desc, eq, getColumns, ilike, or } from "drizzle-orm";

import { db } from "../db";
import { departments, subjects } from "../db/schema";

const router = express.Router();

// Get all subjects with optional search, filtering, and pagination
router.get("/", async (req, res) => {
  try {
    const { search, department, page = "1", limit = "10" } = req.query;

    const currentPage = Math.max(1, Number(page));
    const limitPerPage = Math.max(1, Number(limit));

    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    // If search query exists, filter by subject name OR subject code
    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`),
        ),
      );
    }

    // If department filter exists, match department name
    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
    }

    // Combine all filters using AND if any exist
    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    const countResult = await db
      .select({
        count: count(),
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    const subjectsList = await db
      .select({
        ...getColumns(subjects),
        department: {
          ...getColumns(departments),
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error("GET /subjects error:", error);

    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Cause:", error.cause);
    }

    res.status(500).json({
      error: "Failed to get subjects",
      message: error instanceof Error ? error.message : String(error),
      cause:
        error instanceof Error && error.cause instanceof Error
          ? error.cause.message
          : String(error instanceof Error ? error.cause : ""),
    });
  }
});

router.get("/getDepartments", async (req, res) => {
  const result = await db
    .select({
      id: subjects.id,
    })
    .from(subjects);

  res.status(200).json({
    data: result,
  });
});

// router.get("/:id", async (req, res) => {});

export default router;
