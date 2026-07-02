import { NextResponse } from "next/server";
import { prisma } from "@/lib/server/db";
import { toggleFavorite } from "@/lib/server/job-service";

type Params = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: Params) {
  const { id } = await params;
  const track = await toggleFavorite(prisma, id);
  if (!track) return NextResponse.json({ error: "Track not found." }, { status: 404 });
  return NextResponse.json(track);
}
