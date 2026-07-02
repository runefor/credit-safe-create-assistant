import { readFileSync } from "node:fs";
import { test, expect } from "@playwright/test";

test("README and demo script preserve public-safe framing", () => {
  const readme = readFileSync("README.md", "utf8");
  const demoScript = readFileSync("docs/demo-script.md", "utf8");

  expect(readme).toContain("AI 음악 생성 제품을 만든다면");
  expect(readme).toContain("내부 시스템을 재현하려는 목적이 아닙니다");
  expect(readme).toContain("실제 AI 음악 생성은 수행하지 않습니다");
  expect(demoScript).toContain("not a Muzig internal system reproduction");
  expect(readme).not.toContain("real credit billing is implemented");
});
