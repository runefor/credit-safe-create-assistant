# Acceptance Checklist

Use this checklist before marking the portfolio demo complete.

Last verified: 2026-07-02.

## Flagship flow

- [x] `/create` renders a brief form with prompt, genre, style tags, use case, and commercial intent.
- [x] `POST /api/brief/validate` returns a numeric quality score.
- [x] An underspecified prompt returns at least one deterministic warning and suggestion.
- [x] Validation returns an estimated mock credit cost.
- [x] Create page displays validation output before job submission.
- [x] `POST /api/generation-jobs` returns a job id and initial `queued` status.
- [x] Reusing the same idempotency key returns/reuses the original common-path job.
- [x] `GET /api/generation-jobs/:id` returns status, timeline, attempt, and brief snapshot.
- [x] Polling UI displays `queued`, `running`, and a terminal `completed` or `failed` state.
- [x] Failed jobs can be retried while preserving prior attempt history.
- [x] Completed jobs create or expose a workspace track card.
- [x] `/workspace` card includes tags, favorite/version note, and attribution/licensing badge.

## Sidecar flow

- [x] `/city-context` renders mock context controls.
- [x] Rainy night + low speed maps to chill/lo-fi/soft-percussion-style tags.
- [x] Missing or denied location uses a mock fallback.
- [x] Explanation card states why the tags/brief were selected.

## Public-safe documentation

- [x] Korean README frames the project as an AI music product problem-solving portfolio demo.
- [x] Korean README says it is not trying to reproduce any internal system.
- [x] Korean README does not claim real AI generation, billing, legal enforcement, or internal API behavior.
- [x] Demo script uses mock/simulation wording.
- [x] No 지원서/면접 wording is presented as the user's final personal claim without review.

## Portfolio explanation

- [x] README explains the product problems being solved, not only the stack list.
- [x] README explains why Next.js, TypeScript, Zod, Prisma/SQLite, deterministic jobs, Vitest, and Playwright are used.
- [x] `docs/product-context.md` provides a public-safe product context instead of publishing raw deep-research notes.
- [x] `docs/technical-decisions.md` maps each technology choice to a concrete product/engineering problem.
- [x] `docs/architecture.md` documents current MVP boundaries and a production replacement path.
- [x] Zod is actually used at the API boundary, so the documentation matches the implementation.

## Verification commands

Run from `portfolio/credit-safe-create-assistant/`:

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

Record PASS/FAIL with short output references. If E2E is unavailable, document the manual browser smoke path and why automated E2E is deferred.

## Verification record

2026-07-02 from `portfolio/credit-safe-create-assistant/`:

- PASS `npm run lint`
- PASS `npm run typecheck`
- PASS `npm test` - 3 test files, 8 tests
- PASS `npm run build` - after clearing stale `.next` cache
- PASS `npm run test:e2e` - 3 Playwright tests
