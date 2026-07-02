import type { JobStatus, TimelineEvent } from "../types";

export type RunnerJob = {
  status: string;
  demoOutcome: string;
  timelineJson: string;
  createdAt: Date;
};

export type RunnerDecision = {
  status: JobStatus;
  errorCode: string | null;
  timeline: TimelineEvent[];
};

const RUNNING_AFTER_MS = 900;
const TERMINAL_AFTER_MS = 2600;

export class LocalDeterministicJobRunner {
  decide(job: RunnerJob, now = new Date()): RunnerDecision {
    const timeline = parseTimeline(job.timelineJson);
    const elapsedMs = now.getTime() - job.createdAt.getTime();
    let nextStatus: JobStatus = "queued";
    let errorCode: string | null = null;

    if (elapsedMs >= TERMINAL_AFTER_MS) {
      if (job.demoOutcome === "fail") {
        nextStatus = "failed";
        errorCode = "SIMULATED_GENERATION_FAILURE";
      } else {
        nextStatus = "completed";
      }
    } else if (elapsedMs >= RUNNING_AFTER_MS) {
      nextStatus = "running";
    }

    return {
      status: nextStatus,
      errorCode,
      timeline: backfillTimeline(timeline, job.createdAt, now, nextStatus, errorCode),
    };
  }
}

export function parseTimeline(timelineJson: string): TimelineEvent[] {
  try {
    const parsed = JSON.parse(timelineJson) as TimelineEvent[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function labelForStatus(status: JobStatus | "retry_requested", errorCode?: string | null): string {
  if (status === "queued") return "Job accepted and queued by the local simulator.";
  if (status === "running") return "Mock generation worker is preparing an audio card.";
  if (status === "completed") return "Mock track completed and saved to workspace.";
  if (status === "failed") return `Simulated failure${errorCode ? ` (${errorCode})` : ""}; retry is available.`;
  return "Retry requested; new attempt created for the same brief family.";
}

function backfillTimeline(
  timeline: TimelineEvent[],
  createdAt: Date,
  now: Date,
  nextStatus: JobStatus,
  errorCode: string | null,
): TimelineEvent[] {
  const output = [...timeline];
  const has = (status: JobStatus | "retry_requested") => output.some((event) => event.status === status);

  if ((nextStatus === "running" || nextStatus === "completed" || nextStatus === "failed") && !has("running")) {
    output.push({
      status: "running",
      label: labelForStatus("running"),
      at: new Date(createdAt.getTime() + RUNNING_AFTER_MS).toISOString(),
    });
  }

  if ((nextStatus === "completed" || nextStatus === "failed") && !has(nextStatus)) {
    output.push({
      status: nextStatus,
      label: labelForStatus(nextStatus, errorCode),
      at: now.toISOString(),
    });
  }

  return output;
}
