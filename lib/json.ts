export function parseJsonArray(value: string | null | undefined): string[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

export function toJson(value: unknown): string {
  return JSON.stringify(value);
}

export async function readJsonBody(request: Request): Promise<{ ok: true; body: unknown } | { ok: false; error: string }> {
  try {
    return { ok: true, body: await request.json() };
  } catch {
    return { ok: false, error: "Request body must be valid JSON." };
  }
}
