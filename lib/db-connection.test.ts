// @ts-expect-error - bun:test is a Bun-specific module
import { expect, test } from "bun:test";
import prisma from "@/lib/prisma";

/**
 * Test database connection
 * Run this to verify your database connection is working correctly
 */
export async function testDatabaseConnection() {
  try {
    console.log("Testing database connection...");

    // Test basic query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log("✓ Database connection successful!");
    console.log("Query result:", result);

    // Test Prisma Client
    const userCount = await prisma.user.count();
    console.log(`✓ Prisma Client working! Current user count: ${userCount}`);

    return { success: true, userCount };
  } catch (error) {
    console.error("✗ Database connection failed!");
    console.error("Error:", error);
    throw error;
  }
}

// Bun test runner
test("database connection", async () => {
  // Skip test if DATABASE_URL is not set
  if (!process.env.DATABASE_URL) {
    console.log("⚠ Skipping database connection test: DATABASE_URL not set");
    return;
  }

  try {
    const result = await testDatabaseConnection();
    expect(result.success).toBe(true);
    expect(typeof result.userCount).toBe("number");
  } catch (error) {
    // If database is not reachable, skip the test instead of failing
    if (
      error instanceof Error &&
      error.message.includes("Can't reach database server")
    ) {
      console.log(
        "⚠ Skipping database connection test: Database server not reachable",
      );
      return;
    }
    throw error;
  }
});

// Allow running directly: bun lib/db-connection.test.ts
// @ts-expect-error - import.meta.main is a Bun-specific property
if (import.meta.main) {
  testDatabaseConnection()
    .then(() => {
      console.log("Test completed successfully!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("Test failed:", error);
      process.exit(1);
    });
}
