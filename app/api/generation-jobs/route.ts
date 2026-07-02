import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/json";
import { prisma } from "@/lib/server/db";
import { createGenerationJob } from "@/lib/server/job-service";
import { formatZodIssues, generationJobInputSchema } from "@/lib/validation";

export async function POST(request: Request) {
  const idempotencyKey = request.headers.get("Idempotency-Key");
  if (!idempotencyKey) {
    return NextResponse.json({ error: "Idempotency-Key header is required." }, { status: 400 });
  }

  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json({ error: bodyResult.error }, { status: 400 });
  }

  const parsed = generationJobInputSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid generation job input.", issues: formatZodIssues(parsed.error) }, { status: 400 });
  }

  const { demoOutcome, ...briefInput } = parsed.data;
  const job = await createGenerationJob(prisma, briefInput, idempotencyKey, demoOutcome);

  return NextResponse.json({ jobId: job.jobId, status: job.status, attempt: job.attempt, timeline: job.timeline });
}
