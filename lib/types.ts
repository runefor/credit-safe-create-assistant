export type BriefInput = {
  prompt: string;
  genre: string;
  styleTags: string[];
  useCase: string;
  commercialIntent: boolean;
};

export type ValidationResult = {
  qualityScore: number;
  estimatedCredits: number;
  warnings: string[];
  suggestions: string[];
  normalizedBrief: {
    mood: string[];
    usage: string;
    genre: string;
    licenseBadge: string;
    publicSafetyNote: string;
  };
};

export type JobStatus = "queued" | "running" | "completed" | "failed";

export type TimelineEvent = {
  status: JobStatus | "retry_requested";
  label: string;
  at: string;
};

export type JobResponse = {
  jobId: string;
  status: JobStatus;
  attempt: number;
  timeline: TimelineEvent[];
  briefSnapshot: BriefInput & ValidationResult;
  resultTrack?: WorkspaceTrack;
  error?: string | null;
};

export type WorkspaceTrack = {
  id: string;
  jobId: string;
  title: string;
  tags: string[];
  licenseBadge: string;
  mockAudioUrl: string;
  favorite: boolean;
  versionNote: string;
  createdAt: string;
};
