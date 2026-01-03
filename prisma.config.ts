// Prisma configuration
// Simplified to use standard engine (no driver adapters)
import * as dotenv from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local development
dotenv.config({ path: '.env.local' });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DATABASE_URL"],
  },
  // Explicitly do NOT use driver adapters
  // Using standard binary engine
});
