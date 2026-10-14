import express from "express";
import { and, count, desc, eq, getColumns, ilike, or } from "drizzle-orm";

import { db } from "../db/index.js";
import { departments, subjects } from "../db/schema/index.js";

const router = express.Router();

// Get all subjects with optional search, filtering, and pagination
router.get("/", async (req, res) => {
  try {
    const MAX_LIMIT = 100;
    const { search, department, page = "1", limit = "10" } = req.query;

    if (
      typeof page !== "string" ||
      typeof limit !== "string" ||
      page.trim() === "" ||
      limit.trim() === ""
    ) {
      return res.status(400).json({
        message: "Page and limit must be valid numbers.",
      });
    }

    const currentPage = Number(page);
    const limitPerPage = Number(limit);

    if (
      !Number.isInteger(currentPage) ||
      currentPage < 1 ||
      !Number.isInteger(limitPerPage) ||
      limitPerPage < 1 ||
      limitPerPage > MAX_LIMIT
    ) {
      return res.status(400).json({
        message: `Page must be a positive integer and limit must be between 1 and ${MAX_LIMIT}.`,
      });
    }

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

    const subjectList = await db
      .select({
        ...getColumns(subjects),
        department: {
          ...getColumns(departments),
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.departmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createdAt), desc(subjects.id))
      .limit(limitPerPage)
      .offset((currentPage - 1) * limitPerPage);

    res.status(200).json({
      data: subjectList,
      pagination: {
        page: currentPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error("Failed to get subjects:", error);

    if (error instanceof Error) {
      console.error("Message:", error.message);
      console.error("Cause:", error.cause);
    }

    return res.status(500).json({
      error: "Failed to get subjects",
      message: "An unexpected error occurred while fetching subjects.",
    });
  }
});

export default router;
