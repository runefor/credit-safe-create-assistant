import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { listWorkspaceTracks } from "@/lib/server/job-service";

export async function GET() {
  const tracks = await listWorkspaceTracks(prisma);
  return NextResponse.json({ tracks });
}
