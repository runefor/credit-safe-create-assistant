# Demo Script: Credit-Safe Create Assistant

Use this script for a short portfolio walkthrough or GIF/video capture. Keep the narration public-safe: this is a **public-flow-inspired demo**, not a Muzig internal system reproduction.

## 60-second version

1. **Landing page**
   - "This project demonstrates a safe full-stack AI music creation workflow: validate a brief, estimate mock credits, create an async job, and save a mock result to workspace."

2. **Brief validation**
   - Open `/create`.
   - Enter: `travel music`.
   - Show deterministic warnings such as missing use case, tempo, mood, or instrument detail.
   - Add genre, style tags, use case, and commercial intent.
   - Show quality score, suggestions, normalized brief, and mock credit estimate.

3. **Generation job**
   - Submit the validated brief.
   - Call out the idempotency key: "repeated submits should reuse the same common-path job instead of double charging mock credits."
   - Show timeline states: `queued`, `running`, then `completed` or `failed`.

4. **Retry path**
   - Trigger or select the deterministic failed-job fixture.
   - Show retry preserving attempt history.

5. **Workspace**
   - Open `/workspace`.
   - Show mock track card with tags, favorite/version note, and attribution/licensing reminder.

6. **Sidecar**
   - Open `/city-context`.
   - Set rainy night + low speed.
   - Show explanation: why those context inputs map to chill/lo-fi/soft-percussion tags.

## Safe wording

Use:

- "public-flow-inspired demo"
- "mock credit estimate"
- "deterministic local job simulation"
- "rational product interpretation"
- "workspace-style result card"

Avoid:

- "Muzig internal API"
- "actual Muzig queue/model"
- "real music generation"
- "real billing"
- "legal/license guarantee"

## Capture checklist

- Validation warning visible before submit.
- Improved brief score and estimated credits visible.
- Job id and status timeline visible.
- Retry attempt history visible.
- Workspace card visible.
- Sidecar explanation visible.
- README non-claim section visible or referenced at the end.
