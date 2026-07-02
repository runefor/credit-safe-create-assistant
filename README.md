# Credit-Safe Create Assistant

> AI 음악 생성 제품을 만든다면, 단순히 "생성하기" 버튼만으로 충분할까?
> 이 프로젝트는 그 질문에서 출발한 포트폴리오용 full-stack demo입니다.

AI 음악 생성 제품에서는 prompt 입력 이후에도 여러 제품/기술 문제가 발생할 수 있습니다. 예를 들어 prompt가 너무 모호할 수 있고, 사용자는 생성 전에 예상 credit 비용을 알고 싶을 수 있으며, 중복 클릭으로 같은 작업이 여러 번 생성될 수도 있습니다. 생성 작업은 즉시 끝나지 않을 수 있고, 실패했을 때 재시도와 이력 보존도 필요합니다.

**Credit-Safe Create Assistant**는 이런 문제를 가정하고, 생성 전 검증부터 mock credit 추정, idempotent async job, retry, workspace 저장까지 하나의 제품 흐름으로 구현한 데모입니다.

이 프로젝트는 Muzig AI 또는 특정 회사의 내부 시스템을 재현하려는 목적이 아닙니다. 실제 AI 음악 생성, 실제 과금, 실제 라이선스 판정도 수행하지 않습니다. 공개적으로 상상 가능한 AI 음악 생성 제품의 문제를 바탕으로, 제가 어떤 방식으로 제품 흐름과 기술 경계를 설계하는지 보여주기 위한 작업입니다.

## 포트폴리오 핵심 질문

AI 음악 생성 제품을 설계한다면 다음 문제가 생길 수 있다고 봤습니다.

| 문제 | 구현한 해결 방식 |
| --- | --- |
| Prompt가 너무 모호함 | quality score, warnings, suggestions 제공 |
| 생성 전에 비용을 알기 어려움 | simulated credit estimate 제공 |
| 사용자가 버튼을 여러 번 누름 | `Idempotency-Key`로 중복 job 생성 방지 |
| 생성은 즉시 끝나지 않음 | `queued -> running -> completed/failed` async job 모델링 |
| 생성 실패 시 UX가 끊김 | retry flow와 attempt history 보존 |
| 결과물이 흩어짐 | completed mock track을 workspace card로 저장 |
| 상업적 사용/라이선스 오해 가능성 | attribution/licensing reminder와 non-claim 문구 표시 |

## 왜 이 기술을 썼나

- **Next.js App Router**
  UI route와 API route를 한 프로젝트에서 구현해, 별도 백엔드 없이 full-stack MVP를 빠르게 검증하기 위해 사용했습니다.

- **TypeScript**
  UI state, API payload, service response, persisted model이 어긋나지 않도록 `BriefInput`, `JobResponse`, `WorkspaceTrack` 같은 계약을 타입으로 관리했습니다.

- **Zod**
  API route boundary에서 malformed payload를 먼저 걸러내고, style tags 문자열/배열 입력을 normalize했습니다. 단, 짧거나 모호한 prompt는 hard reject하지 않고 제품 레벨 warning/suggestion으로 안내합니다.

- **Prisma + SQLite**
  외부 인프라 없이 로컬에서 재현 가능한 persistence를 만들기 위해 SQLite를 사용했고, 데이터 접근 경계를 Prisma model로 분리했습니다.

- **Deterministic local job runner**
  실제 AI 생성 모델을 붙이지 않고도 async queue/worker UX를 보여주기 위해, 시간 기반으로 `queued -> running -> completed/failed` 상태를 결정하는 runner를 만들었습니다. 덕분에 retry demo와 E2E test가 안정적으로 재현됩니다.

- **Vitest + Playwright**
  단순 화면 캡처가 아니라 validation, idempotency, retry, workspace persistence, public-safe 문구가 실제로 동작하는지 검증했습니다.

자세한 설명:

- [`docs/product-context.md`](docs/product-context.md)
- [`docs/technical-decisions.md`](docs/technical-decisions.md)
- [`docs/architecture.md`](docs/architecture.md)
- [`docs/acceptance-checklist.md`](docs/acceptance-checklist.md)

## 구현된 기능

- `/create`
  - 음악 brief 입력
  - prompt 품질 검증
  - warning/suggestion 표시
  - simulated credit estimate 표시
  - idempotent generation job 생성
  - job timeline polling
  - failed job retry

- `/workspace`
  - completed mock track card 표시
  - tags, version note, mock audio URL 표시
  - favorite toggle
  - attribution/licensing reminder 표시

- `/city-context`
  - mock location/time/weather/speed 입력
  - context를 음악 brief로 매핑
  - 왜 그런 tag/tempo가 선택됐는지 explanation 제공

- `/api/*`
  - `POST /api/brief/validate`
  - `POST /api/generation-jobs`
  - `GET /api/generation-jobs/:id`
  - `POST /api/generation-jobs/:id/retry`
  - `GET /api/workspace/tracks`
  - `POST /api/workspace/tracks/:id/favorite`

## 실행 방법

```bash
npm install
cp .env.example .env
npm run prisma:push
npm run dev
```

브라우저에서 `http://localhost:3000`을 엽니다.

## 검증 방법

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

현재 검증 상태:

- `npm run lint` PASS
- `npm run typecheck` PASS
- `npm run test` PASS - 3 files, 8 tests
- `npm run build` PASS
- `npm run test:e2e` PASS - 3 Playwright tests

## API 예시

### `POST /api/brief/validate`

Request:

```json
{
  "prompt": "summer vlog BGM for bright ocean travel",
  "genre": "pop",
  "styleTags": ["bright", "upbeat"],
  "useCase": "short-form video",
  "commercialIntent": true
}
```

Response는 `qualityScore`, `estimatedCredits`, `warnings`, `suggestions`, `normalizedBrief`를 포함합니다.

### `POST /api/generation-jobs`

Headers:

```txt
Idempotency-Key: <uuid>
```

Request body는 brief fields와 demo용 `demoOutcome: "success" | "fail"`을 받을 수 있습니다.

Response:

```json
{ "jobId": "...", "status": "queued", "attempt": 1, "timeline": [] }
```

## 데이터 모델 요약

- `Brief`
  - prompt, genre, use case, style tags, validation score, warnings, suggestions, estimated credits
- `GenerationJob`
  - idempotency key, status, attempt, demo outcome, timeline, error code, result track
- `Track`
  - title, tags, license badge, mock audio URL, favorite flag, version note

## 명확한 non-claim

- 실제 AI 음악 생성은 수행하지 않습니다.
- 실제 credit 과금 또는 차감은 수행하지 않습니다.
- 실제 법적/라이선스 판정은 수행하지 않습니다.
- 특정 회사의 내부 API, 내부 아키텍처, 모델 동작, 비공개 workflow를 주장하지 않습니다.
- 모든 생성/credit/audio 동작은 포트폴리오 설명을 위한 deterministic mock입니다.
