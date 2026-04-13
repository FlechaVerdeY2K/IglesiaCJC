import { NextResponse } from "next/server";
import { getLiveStatus } from "@/lib/live-status";

export const revalidate = 120;

export async function GET() {
  const status = await getLiveStatus();
  return NextResponse.json(status);
}
