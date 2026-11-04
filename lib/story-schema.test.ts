import { test } from "node:test";
import assert from "node:assert/strict";
import { storySchema } from "./story-schema.ts";

// 可配置结构的验证：章数 / 每章岔路数 / 每岔选项数都不再写死。
const option = (id: string) => ({
  id,
  text: "选项",
  cost: "代价",
  dimension: "self",
  direction: "up",
  reason: "原因",
});

const fork = (id: string, optionCount: number) => ({
  id,
  scenes: ["一屏场景"],
  prompt: "她准备如何回应？",
  options: Array.from({ length: optionCount }, (_, i) => option(`${id}-o${i}`)),
});

const story = (chapters: Array<{ forks: ReturnType<typeof fork>[] }>) => ({
  id: "test-story",
  status: "draft",
  kind: "ordinary",
  card: {
    name: "测试角色",
    tagline: "一句话",
    theme: "议题",
    minutes: 12,
    intensity: "中",
    question: "核心问题",
  },
  situation: {
    who: "她",
    wants: "想要",
    resources: ["资源"],
    constraints: ["限制"],
  },
  chapters: chapters.map((chapter, index) => ({
    id: `chapter-${index}`,
    title: `第 ${index + 1} 章`,
    forks: chapter.forks,
    coach: {},
    coachDefault: "章末回望",
  })),
  endings: [{ id: "end", title: "结局", text: "结局正文", fallback: true }],
  closingQuestion: "开放问题",
  aiAssisted: true,
});

test("a three-chapter story with two forks and two options parses", () => {
  const parsed = storySchema.parse(
    story([2, 2, 2].map(() => ({ forks: [fork("f0", 2), fork("f1", 2)] }))),
  );
  assert.equal(parsed.chapters.length, 3);
  assert.equal(parsed.chapters[0].forks.length, 2);
  assert.equal(parsed.chapters[0].forks[0].options.length, 2);
  // 新增字段都有默认值
  assert.equal(parsed.version, "1.0.0");
  assert.equal(parsed.access, "free");
  assert.deepEqual(parsed.endings[0].losses, []);
  assert.deepEqual(parsed.endings[0].unresolved, []);
});

test("the confirmed spec fields are accepted", () => {
  const base = story([2, 2, 2].map(() => ({ forks: [fork("f0", 3)] })));
  const parsed = storySchema.parse({
    ...base,
    version: "1.2.0",
    access: "unlock",
    disclaimer: { text: "虚构故事，受真实人物启发", virtualInstitutions: true },
    person: {
      ageRange: "30 岁左右",
      stage: "职业上升期",
      occupation: "医生",
      relations: ["病人", "同事"],
      fixedFacts: ["受过医学训练"],
    },
    qa: {
      testCriteria: ["三选项都需要代价"],
      counterExamples: ["伪选择", "隐藏正确答案"],
    },
  });
  assert.equal(parsed.version, "1.2.0");
  assert.equal(parsed.access, "unlock");
  assert.equal(parsed.disclaimer?.virtualInstitutions, true);
  assert.equal(parsed.person?.occupation, "医生");
  assert.equal(parsed.qa?.counterExamples.length, 2);
});

test("structure limits are enforced", () => {
  // 只有 2 章 → 低于下限 3
  assert.throws(() =>
    storySchema.parse(story([2, 2].map(() => ({ forks: [fork("f0", 3)] })))),
  );
  // 每章 5 个岔路 → 高于上限 4
  assert.throws(() =>
    storySchema.parse(
      story([2, 2, 2].map(() => ({ forks: Array.from({ length: 5 }, (_, i) => fork(`f${i}`, 3)) }))),
    ),
  );
  // 每岔 5 个选项 → 高于上限 4
  assert.throws(() =>
    storySchema.parse(story([2, 2, 2].map(() => ({ forks: [fork("f0", 5)] })))),
  );
});
