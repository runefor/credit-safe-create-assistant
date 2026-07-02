import { describe, expect, it } from "vitest";
import { briefInputSchema, generationJobInputSchema, validateBrief } from "@/lib/validation";

describe("validateBrief", () => {
  it("returns deterministic warnings, suggestions, score, and credits for an underspecified prompt", () => {
    const result = validateBrief({
      prompt: "nice bgm",
      genre: "pop",
      styleTags: [],
      useCase: "",
      commercialIntent: true,
    });

    expect(result.qualityScore).toBeGreaterThanOrEqual(20);
    expect(result.estimatedCredits).toBeGreaterThan(0);
    expect(result.warnings).toContain("Prompt is underspecified for a reliable music brief.");
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
    expect(result.suggestions.length).toBeGreaterThanOrEqual(1);
    expect(result.normalizedBrief.licenseBadge).toContain("Commercial intent");
    expect(result.normalizedBrief.publicSafetyNote).toContain("not a Muzig internal system");
  });

  it("normalizes comma-delimited style tags through the Zod API schema", () => {
    const parsed = briefInputSchema.parse({
      prompt: "Bright 105 BPM synth cue with drums for a travel video.",
      genre: "Pop",
      styleTags: "Bright, Upbeat, Travel",
      useCase: "short-form video",
      commercialIntent: true,
    });

    expect(parsed.styleTags).toEqual(["bright", "upbeat", "travel"]);
  });

  it("rejects malformed generation job demo outcomes before service execution", () => {
    const parsed = generationJobInputSchema.safeParse({
      prompt: "Bright 105 BPM synth cue with drums for a travel video.",
      genre: "pop",
      styleTags: ["bright"],
      useCase: "short-form video",
      commercialIntent: true,
      demoOutcome: "explode",
    });

    expect(parsed.success).toBe(false);
  });
});
