import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "backyard-vendor",
    env: process.env.NEXT_PUBLIC_APP_ENV ?? "unknown",
    timestamp: new Date().toISOString(),
  });
}
