import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/json";
import { briefInputSchema, formatZodIssues, validateBrief } from "@/lib/validation";

export async function POST(request: Request) {
  const bodyResult = await readJsonBody(request);
  if (!bodyResult.ok) {
    return NextResponse.json({ error: bodyResult.error }, { status: 400 });
  }

  const parsed = briefInputSchema.safeParse(bodyResult.body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid brief input.", issues: formatZodIssues(parsed.error) }, { status: 400 });
  }

  const result = validateBrief(parsed.data);
  return NextResponse.json(result);
}
