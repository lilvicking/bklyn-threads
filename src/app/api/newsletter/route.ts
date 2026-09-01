import { NextResponse } from "next/server";

/**
 * Placeholder newsletter endpoint.
 * In production, persist `email` to your mailing-list provider or a
 * `Subscriber` table in `prisma/schema.prisma`. For now it echoes 200 so the
 * Footer signup form is fully functional end-to-end.
 */
export async function POST(req: Request) {
  const { email } = await req.json().catch(() => ({}));
  if (!email || typeof email !== "string") {
    return NextResponse.json({ ok: false, error: "email required" }, { status: 400 });
  }
  console.log("[newsletter] signup:", email.trim());
  return NextResponse.json({ ok: true });
}
