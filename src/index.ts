import "dotenv/config";

// Uncomment for debugging
// console.log("DATABASE_URL exists:", !!process.env.DATABASE_URL);
//
// if (process.env.DATABASE_URL) {
//   try {
//     const url = new URL(process.env.DATABASE_URL);
//
//     console.log({
//       protocol: url.protocol,
//       username: url.username,
//       host: url.host,
//       database: url.pathname,
//     });
//   } catch (error) {
//     console.error("DATABASE_URL is malformed:", error);
//   }
// }

import express from "express";
import subjectsRouter from "./routes/subject";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

app.use(express.json());

app.use("/api/subjects", subjectsRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
