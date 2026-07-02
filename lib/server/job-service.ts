import { randomUUID } from "crypto";
import type { Brief, GenerationJob, PrismaClient, Track } from "@prisma/client";
import { validateBrief } from "../validation";
import type { BriefInput, JobResponse, JobStatus, TimelineEvent, ValidationResult, WorkspaceTrack } from "../types";
import { labelForStatus, LocalDeterministicJobRunner, parseTimeline } from "./job-runner";

type PrismaLike = PrismaClient;

type JobWithRelations = GenerationJob & {
  brief: Brief;
  resultTrack: Track | null;
};

export async function createGenerationJob(
  db: PrismaLike,
  input: BriefInput,
  idempotencyKey: string,
  demoOutcome: "success" | "fail" = "success",
): Promise<JobResponse> {
  const existing = await db.generationJob.findUnique({
    where: { idempotencyKey },
    include: { brief: true, resultTrack: true },
  });

  if (existing) {
    const refreshed = await refreshJob(db, existing.id);
    return toJobResponse(refreshed ?? existing);
  }

  const validation = validateBrief(input);
  const normalizedInput = normalizeBriefInput(input);
  const now = new Date();
  const timeline: TimelineEvent[] = [
    {
      status: "queued",
      label: labelForStatus("queued"),
      at: now.toISOString(),
    },
  ];

  const job = await db.$transaction(async (tx) => {
    const brief = await tx.brief.create({
      data: {
        prompt: normalizedInput.prompt,
        genre: normalizedInput.genre,
        useCase: normalizedInput.useCase,
        commercialIntent: normalizedInput.commercialIntent,
        styleTagsJson: JSON.stringify(normalizedInput.styleTags),
        validationScore: validation.qualityScore,
        warningsJson: JSON.stringify(validation.warnings),
        suggestionsJson: JSON.stringify(validation.suggestions),
        estimatedCredits: validation.estimatedCredits,
      },
    });

    return tx.generationJob.create({
      data: {
        briefId: brief.id,
        idempotencyKey,
        status: "queued",
        attempt: 1,
        demoOutcome,
        timelineJson: JSON.stringify(timeline),
      },
      include: { brief: true, resultTrack: true },
    });
  });

  return toJobResponse(job);
}

export async function getGenerationJob(db: PrismaLike, jobId: string): Promise<JobResponse | null> {
  const job = await refreshJob(db, jobId);
  return job ? toJobResponse(job) : null;
}

export async function retryGenerationJob(db: PrismaLike, jobId: string): Promise<JobResponse | null> {
  const original = await db.generationJob.findUnique({
    where: { id: jobId },
    include: { brief: true, resultTrack: true },
  });
  if (!original) return null;

  const previousTimeline = parseTimeline(original.timelineJson);
  const now = new Date();
  const retryTimeline: TimelineEvent[] = [
    ...previousTimeline,
    {
      status: "retry_requested",
      label: labelForStatus("retry_requested"),
      at: now.toISOString(),
    },
    {
      status: "queued",
      label: labelForStatus("queued"),
      at: now.toISOString(),
    },
  ];

  const retry = await db.generationJob.create({
    data: {
      briefId: original.briefId,
      idempotencyKey: `${original.idempotencyKey}:retry:${original.attempt + 1}:${randomUUID()}`,
      status: "queued",
      attempt: original.attempt + 1,
      demoOutcome: "success",
      timelineJson: JSON.stringify(retryTimeline),
    },
    include: { brief: true, resultTrack: true },
  });

  return toJobResponse(retry);
}

export async function listWorkspaceTracks(db: PrismaLike): Promise<WorkspaceTrack[]> {
  const tracks = await db.track.findMany({ orderBy: { createdAt: "desc" } });
  return tracks.map(toWorkspaceTrack);
}

export async function toggleFavorite(db: PrismaLike, trackId: string): Promise<WorkspaceTrack | null> {
  const track = await db.track.findUnique({ where: { id: trackId } });
  if (!track) return null;
  const updated = await db.track.update({ where: { id: trackId }, data: { favorite: !track.favorite } });
  return toWorkspaceTrack(updated);
}

export async function refreshJob(db: PrismaLike, jobId: string): Promise<JobWithRelations | null> {
  const current = await db.generationJob.findUnique({
    where: { id: jobId },
    include: { brief: true, resultTrack: true },
  });
  if (!current) return null;
  if (current.status === "completed" || current.status === "failed") return current;

  const runner = new LocalDeterministicJobRunner();
  const decision = runner.decide(current);
  const statusChanged = decision.status !== current.status;
  if (!statusChanged) return current;

  const updated = await db.generationJob.update({
    where: { id: jobId },
    data: {
      status: decision.status,
      errorCode: decision.errorCode,
      timelineJson: JSON.stringify(decision.timeline),
    },
    include: { brief: true, resultTrack: true },
  });

  if (decision.status === "completed") {
    await materializeTrack(db, updated);
    const withTrack = await db.generationJob.findUnique({
      where: { id: jobId },
      include: { brief: true, resultTrack: true },
    });
    return withTrack;
  }

  return updated;
}

async function materializeTrack(db: PrismaLike, job: JobWithRelations): Promise<void> {
  const existing = await db.track.findUnique({ where: { jobId: job.id } });
  if (existing) return;

  const styleTags = parseJson<string[]>(job.brief.styleTagsJson, []);
  const tags = Array.from(new Set([job.brief.genre, job.brief.useCase, ...styleTags])).filter(Boolean).slice(0, 6);
  const track = await db.track.create({
    data: {
      jobId: job.id,
      title: titleFromBrief(job.brief.prompt),
      tagsJson: JSON.stringify(tags),
      licenseBadge: job.brief.commercialIntent
        ? "Commercial intent: attribution/licensing reminder required"
        : "Demo/personal intent: simulated attribution reminder",
      mockAudioUrl: "/mock-audio/public-flow-inspired-preview.wav",
      versionNote: `Attempt ${job.attempt}: deterministic mock result; no real AI music was generated.`,
    },
  });
  await db.generationJob.update({ where: { id: job.id }, data: { resultTrackId: track.id } });
}

function toJobResponse(job: JobWithRelations): JobResponse {
  const briefInput = briefToInput(job.brief);
  const validation = briefToValidation(job.brief);
  return {
    jobId: job.id,
    status: job.status as JobStatus,
    attempt: job.attempt,
    timeline: parseTimeline(job.timelineJson),
    briefSnapshot: {
      ...briefInput,
      ...validation,
    },
    resultTrack: job.resultTrack ? toWorkspaceTrack(job.resultTrack) : undefined,
    error: job.errorCode,
  };
}

function toWorkspaceTrack(track: Track): WorkspaceTrack {
  return {
    id: track.id,
    jobId: track.jobId,
    title: track.title,
    tags: parseJson<string[]>(track.tagsJson, []),
    licenseBadge: track.licenseBadge,
    mockAudioUrl: track.mockAudioUrl,
    favorite: track.favorite,
    versionNote: track.versionNote,
    createdAt: track.createdAt.toISOString(),
  };
}

function briefToInput(brief: Brief): BriefInput {
  return {
    prompt: brief.prompt,
    genre: brief.genre,
    styleTags: parseJson<string[]>(brief.styleTagsJson, []),
    useCase: brief.useCase,
    commercialIntent: brief.commercialIntent,
  };
}

function briefToValidation(brief: Brief): ValidationResult {
  return {
    qualityScore: brief.validationScore,
    estimatedCredits: brief.estimatedCredits,
    warnings: parseJson<string[]>(brief.warningsJson, []),
    suggestions: parseJson<string[]>(brief.suggestionsJson, []),
    normalizedBrief: validateBrief(briefToInput(brief)).normalizedBrief,
  };
}

function normalizeBriefInput(input: BriefInput): BriefInput {
  return {
    prompt: input.prompt.trim(),
    genre: input.genre.trim() || "open genre",
    useCase: input.useCase.trim(),
    commercialIntent: Boolean(input.commercialIntent),
    styleTags: input.styleTags.map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 8),
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function titleFromBrief(prompt: string): string {
  const compact = prompt.trim().replace(/\s+/g, " ");
  const firstWords = compact.split(" ").slice(0, 6).join(" ");
  return `${firstWords || "Mock music"} — preview`;
}
