export const REQUIRED_SAFE_PHRASES = [
  "public-flow-inspired demo",
  "not Muzig AI's internal system",
] as const;

export const FORBIDDEN_PUBLIC_CLAIMS = [
  "Muzig internal API",
  "actual Muzig queue",
  "real music generation",
  "real billing",
  "legal guarantee",
] as const;

export function hasRequiredSafePhrases(text: string): boolean {
  return REQUIRED_SAFE_PHRASES.every((phrase) => text.includes(phrase));
}
