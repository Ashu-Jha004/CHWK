import "dotenv/config";
import { defineConfig } from "@prisma/config";

// Detect if we are running a Prisma CLI command (like db push or migrate)
const isCLI = process.argv.some(arg => arg.includes("prisma"));

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    /* If we are running a CLI command, use the DIRECT_URL (Port 5432).
       Otherwise, use the pooled DATABASE_URL (Port 6543).
    */
    url: isCLI ? process.env["DIRECT_URL"] : process.env["DATABASE_URL"],
  },
});