import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { getGenerationJob } from "@/lib/server/job-service";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { id } = await params;
  const job = await getGenerationJob(prisma, id);
  if (!job) return NextResponse.json({ error: "Job not found." }, { status: 404 });
  return NextResponse.json(job);
}
