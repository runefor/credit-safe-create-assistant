import { randomUUID } from "crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "@/lib/server/db";
import { createGenerationJob, getGenerationJob, listWorkspaceTracks, retryGenerationJob, toggleFavorite } from "@/lib/server/job-service";

const richBrief = {
  prompt: "Bright 108 BPM synth pop instrumental for a summer travel video with clean drums and warm bass.",
  genre: "pop",
  styleTags: ["bright", "upbeat"],
  useCase: "short-form video",
  commercialIntent: true,
};

describe("job service", () => {
  beforeEach(async () => {
    await prisma.track.deleteMany();
    await prisma.generationJob.deleteMany();
    await prisma.brief.deleteMany();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("reuses idempotency keys instead of creating duplicate jobs", async () => {
    const key = randomUUID();
    const first = await createGenerationJob(prisma, richBrief, key);
    const second = await createGenerationJob(prisma, richBrief, key);
    const count = await prisma.generationJob.count();

    expect(second.jobId).toBe(first.jobId);
    expect(count).toBe(1);
  });

  it("advances completed jobs and exposes a workspace track", async () => {
    const job = await createGenerationJob(prisma, richBrief, randomUUID());
    await prisma.generationJob.update({
      where: { id: job.jobId },
      data: { createdAt: new Date(Date.now() - 4000) },
    });

    const completed = await getGenerationJob(prisma, job.jobId);
    const tracks = await listWorkspaceTracks(prisma);

    expect(completed?.status).toBe("completed");
    expect(completed?.timeline.map((event) => event.status)).toEqual(expect.arrayContaining(["queued", "running", "completed"]));
    expect(completed?.resultTrack?.licenseBadge).toContain("Commercial intent");
    expect(tracks).toHaveLength(1);
    expect(tracks[0].versionNote).toContain("no real AI music");
  });

  it("preserves failed history and creates a successful retry attempt", async () => {
    const job = await createGenerationJob(prisma, richBrief, randomUUID(), "fail");
    await prisma.generationJob.update({
      where: { id: job.jobId },
      data: { createdAt: new Date(Date.now() - 4000) },
    });
    const failed = await getGenerationJob(prisma, job.jobId);
    const retry = await retryGenerationJob(prisma, job.jobId);

    expect(failed?.status).toBe("failed");
    expect(retry?.attempt).toBe(2);
    expect(retry?.timeline.map((event) => event.status)).toContain("retry_requested");
  });

  it("toggles workspace favorites", async () => {
    const job = await createGenerationJob(prisma, richBrief, randomUUID());
    await prisma.generationJob.update({ where: { id: job.jobId }, data: { createdAt: new Date(Date.now() - 4000) } });
    await getGenerationJob(prisma, job.jobId);
    const [track] = await listWorkspaceTracks(prisma);

    const updated = await toggleFavorite(prisma, track.id);

    expect(updated?.favorite).toBe(true);
  });
});
