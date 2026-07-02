# Architecture

## Current MVP

```mermaid
sequenceDiagram
  participant User
  participant Create as /create
  participant Validate as POST /api/brief/validate
  participant Jobs as /api/generation-jobs
  participant Service as Job service
  participant Runner as LocalDeterministicJobRunner
  participant DB as Prisma + SQLite
  participant Workspace as /workspace

  User->>Create: Enter music brief
  Create->>Validate: Validate brief payload
  Validate-->>Create: Score, warnings, suggestions, estimated credits
  User->>Create: Submit generation job
  Create->>Jobs: POST with Idempotency-Key
  Jobs->>Service: Create or reuse job
  Service->>DB: Persist Brief + GenerationJob
  Jobs-->>Create: queued job id
  Create->>Jobs: Poll job status
  Jobs->>Service: Refresh job
  Service->>Runner: Decide status from elapsed time
  Runner-->>Service: running/completed/failed + timeline
  Service->>DB: Update job and materialize Track on completion
  Create-->>User: Show timeline and retry/open workspace action
  User->>Workspace: Open completed mock track card
  Workspace->>DB: Load saved tracks
```

## Boundaries

### API boundary

- Zod schemas validate request shape.
- Product scoring logic lives in `lib/validation.ts`.
- Route handlers remain thin and delegate to service functions.

### Service boundary

- `job-service.ts` owns idempotency, retry, status refresh, and track materialization.
- UI components do not directly touch Prisma.

### Runner boundary

- `LocalDeterministicJobRunner` is intentionally small.
- It can be replaced by a queue worker without rewriting UI routes.

### Persistence boundary

- Prisma models represent `Brief`, `GenerationJob`, and `Track`.
- SQLite is used for local reproducibility.

## Production replacement path

If this moved beyond portfolio MVP:

1. Replace SQLite with hosted Postgres or Turso.
2. Replace the deterministic runner with a durable queue such as BullMQ, Cloud Tasks, or a managed worker.
3. Store generated audio assets in object storage.
4. Stream status updates with SSE or WebSocket instead of polling.
5. Add user auth and per-user workspace isolation.
6. Add observability around job latency, retry rate, and validation drop-off.
