import { NextResponse } from "next/server";

// GET /api/health — lightweight liveness probe that does NOT touch the
// database, so Railway's healthcheck doesn't depend on DB availability or
// whether the schema has been pushed yet.
export async function GET() {
  return NextResponse.json({ status: "ok" });
}