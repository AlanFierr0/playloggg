import { NextResponse } from "next/server";

export function GET() {
  return NextResponse.json({ error: "Unavailable" }, { status: 404, headers: { "Cache-Control": "private, no-store" } });
}
