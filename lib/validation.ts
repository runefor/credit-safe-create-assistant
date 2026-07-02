import { z } from "zod";
import type { BriefInput, ValidationResult } from "./types";

const TEMPO_TERMS = ["bpm", "tempo", "fast", "slow", "midtempo", "120", "90"];
const INSTRUMENT_TERMS = ["guitar", "piano", "synth", "drum", "bass", "vocal", "instrumental", "strings"];
const MOOD_TERMS = ["bright", "upbeat", "calm", "cinematic", "warm", "energetic", "minimal", "dreamy"];

export const briefInputSchema = z
  .object({
    prompt: z.string().max(1_000, "Prompt must be 1,000 characters or fewer.").default(""),
    genre: z.string().max(80, "Genre must be 80 characters or fewer.").default(""),
    styleTags: z
      .union([z.array(z.string()), z.string()])
      .optional()
      .transform((value) => normalizeStyleTags(value)),
    useCase: z.string().max(120, "Use case must be 120 characters or fewer.").default(""),
    commercialIntent: z.boolean().default(false),
  })
  .strip();

export const generationJobInputSchema = briefInputSchema.extend({
  demoOutcome: z.enum(["success", "fail"]).default("success"),
});

export type GenerationJobInput = z.infer<typeof generationJobInputSchema>;

export function formatZodIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.length > 0 ? `${issue.path.join(".")}: ` : "";
    return `${path}${issue.message}`;
  });
}

export function normalizeStyleTags(styleTags: string[] | string | undefined): string[] {
  if (Array.isArray(styleTags)) {
    return styleTags.map((tag) => tag.trim().toLowerCase()).filter(Boolean).slice(0, 8);
  }
  if (typeof styleTags === "string") {
    return styleTags
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean)
      .slice(0, 8);
  }
  return [];
}

export function validateBrief(input: BriefInput): ValidationResult {
  const prompt = input.prompt.trim();
  const genre = input.genre.trim() || "open genre";
  const useCase = input.useCase.trim();
  const styleTags = normalizeStyleTags(input.styleTags);
  const lowerPrompt = prompt.toLowerCase();
  const warnings: string[] = [];
  const suggestions: string[] = [];
  let score = 56;

  if (prompt.length < 28) {
    warnings.push("Prompt is underspecified for a reliable music brief.");
    suggestions.push("Add scene, audience, tempo, and instrumentation details.");
    score -= 14;
  } else {
    score += 8;
  }

  if (!useCase) {
    warnings.push("Use case is missing, so credit estimate and license reminder are less precise.");
    suggestions.push("Specify whether this is for short-form video, game, podcast, or in-store background music.");
    score -= 12;
  } else {
    score += 8;
  }

  if (!TEMPO_TERMS.some((term) => lowerPrompt.includes(term))) {
    warnings.push("Prompt could specify tempo or BPM range.");
    suggestions.push("Add a BPM range or tempo phrase such as 95-110 BPM, slow, or upbeat.");
    score -= 6;
  } else {
    score += 8;
  }

  if (!INSTRUMENT_TERMS.some((term) => lowerPrompt.includes(term))) {
    warnings.push("Prompt could name instruments or vocal/instrumental preference.");
    suggestions.push("Clarify lead instruments and whether vocals are allowed.");
    score -= 6;
  } else {
    score += 8;
  }

  if (styleTags.length === 0 && !MOOD_TERMS.some((term) => lowerPrompt.includes(term))) {
    warnings.push("Mood/style tags are sparse.");
    suggestions.push("Add 2-4 mood tags like bright, calm, cinematic, or energetic.");
    score -= 5;
  } else {
    score += Math.min(10, styleTags.length * 3 + 3);
  }

  if (input.commercialIntent) {
    score += 2;
    suggestions.push("Keep attribution/licensing notes visible before using generated assets commercially.");
  }

  const estimatedCredits = estimateCredits({ ...input, prompt, genre, useCase, styleTags }, score);
  const mood = styleTags.length > 0 ? styleTags : MOOD_TERMS.filter((term) => lowerPrompt.includes(term)).slice(0, 4);

  return {
    qualityScore: Math.max(20, Math.min(98, score)),
    estimatedCredits,
    warnings: Array.from(new Set(warnings)),
    suggestions: Array.from(new Set(suggestions)),
    normalizedBrief: {
      mood: mood.length > 0 ? mood : ["needs-more-detail"],
      usage: useCase || "unspecified portfolio demo use case",
      genre,
      licenseBadge: input.commercialIntent
        ? "Commercial intent: show attribution/licensing reminder"
        : "Personal/demo intent: simulated credit and attribution reminder",
      publicSafetyNote: "Public-flow-inspired demo; not a Muzig internal system or real generation model.",
    },
  };
}

function estimateCredits(input: BriefInput, score: number): number {
  const base = input.commercialIntent ? 18 : 12;
  const complexity = Math.ceil(Math.min(40, input.prompt.length) / 10) + input.styleTags.length * 2;
  const qualityAdjustment = score >= 78 ? 4 : score < 50 ? -2 : 0;
  return Math.max(8, base + complexity + qualityAdjustment);
}
