import { mkdir, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import { join } from "path";
import { isDev } from "@/lib/dev-utils";

/**
 * POST endpoint for logging client-side errors to persistent log file
 * Only available in development mode
 */
export async function POST(request: Request) {
  if (!isDev()) {
    return NextResponse.json(
      { error: "Not available in production" },
      { status: 403 },
    );
  }

  try {
    const errorData = await request.json();
    const logDir = join(process.cwd(), ".cursor", "tmp");
    const logFile = join(logDir, "client-errors.log");

    // Ensure directory exists
    await mkdir(logDir, { recursive: true });

    // Format log entry with timestamp and JSON error data
    const logEntry = `[${new Date().toISOString()}] ${JSON.stringify(errorData)}\n`;

    // Append to log file
    await writeFile(logFile, logEntry, { flag: "a" });

    return NextResponse.json({ success: true });
  } catch (error) {
    // Log file system errors but don't expose details to client
    console.error("[Debug API] Failed to write error log:", error);
    return NextResponse.json({ error: "Failed to log error" }, { status: 500 });
  }
}
