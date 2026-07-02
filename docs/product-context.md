# Product Context

이 프로젝트는 특정 회사의 내부 구현을 추측하거나 재현하려는 작업이 아닙니다.

대신 다음 질문에서 출발했습니다.

> AI 음악 생성 제품을 만든다면, 단순 생성 기능 외에 어떤 제품/기술 문제가 생길 수 있을까?

## 문제 가정

AI 음악 생성 제품에서는 사용자가 prompt를 입력하고 결과를 기다리는 과정에서 다음 문제가 발생할 수 있습니다.

1. **Prompt 품질 문제**
   - 사용자가 "좋은 배경음악"처럼 너무 짧거나 모호한 prompt를 입력할 수 있습니다.
   - 이때 단순히 실패시키기보다, 어떤 정보가 부족한지 알려주는 것이 제품적으로 더 낫습니다.

2. **Credit safety 문제**
   - 생성형 서비스에서는 비용 또는 credit이 사용자 행동과 연결될 수 있습니다.
   - 따라서 생성 전에 예상 비용을 보여주고, 중복 요청을 막는 흐름이 필요합니다.

3. **Async generation 문제**
   - 음악 생성은 즉시 끝나는 작업이 아닐 수 있습니다.
   - 사용자는 현재 작업이 queued인지, running인지, completed인지, failed인지 알아야 합니다.

4. **Failure recovery 문제**
   - 생성 실패는 자연스러운 제품 상황입니다.
   - 실패 이력을 보존하면서 같은 brief로 재시도할 수 있어야 합니다.

5. **Workspace persistence 문제**
   - 생성된 결과는 한 번 보고 끝나는 것이 아니라 다시 확인하고 관리할 수 있어야 합니다.
   - 따라서 completed output을 workspace card로 저장하는 흐름이 필요합니다.

6. **Attribution/licensing reminder 문제**
   - 음악 생성물은 상업적 사용, attribution, license 확인과 연결될 수 있습니다.
   - 이 데모는 실제 법적 판정을 하지 않지만, 제품 UI에서 reminder를 노출하는 흐름을 포함합니다.

## 이 프로젝트의 범위

이 프로젝트는 위 문제들을 public-safe한 방식으로 풀어보는 portfolio MVP입니다.

포함하는 것:

- prompt validation
- quality score
- warnings/suggestions
- simulated credit estimate
- idempotent job creation
- async status polling
- failed job retry
- workspace track card
- deterministic tests

포함하지 않는 것:

- 실제 AI 음악 생성
- 실제 credit 과금
- 실제 법적/라이선스 판정
- 특정 회사의 내부 API 또는 내부 시스템 재현

## 포트폴리오에서 보여주려는 역량

이 프로젝트가 보여주려는 것은 특정 기술 이름의 나열이 아니라, 다음 역량입니다.

- 제품 문제를 기술 요구사항으로 바꾸는 능력
- 생성형 AI 제품의 edge case를 고려하는 능력
- API boundary와 service boundary를 나누는 능력
- idempotency, retry, persistence 같은 운영 관점을 MVP에 반영하는 능력
- mock과 deterministic runner를 사용해 안전하고 검증 가능한 데모를 만드는 능력
