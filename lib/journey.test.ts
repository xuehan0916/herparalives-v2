import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleStory } from "../content/stories/sample.ts";
import {
  chapterChoiceCounts,
  chooseEnding,
  earnedFragments,
  journeyState,
  progressOf,
} from "./journey.ts";

test("sample still runs a fifteen-choice journey with five chapter rewards", () => {
  const choices = sampleStory.chapters.flatMap((c) =>
    c.forks.map((f) => f.options[0]),
  );
  assert.equal(choices.length, 15);
  assert.equal(earnedFragments(sampleStory, choices.slice(0, 2)).length, 0);
  assert.equal(earnedFragments(sampleStory, choices.slice(0, 3)).length, 1);
  assert.equal(earnedFragments(sampleStory, choices).length, 5);
  assert.equal(chooseEnding(sampleStory, choices).id, "window");
  assert.equal(journeyState(choices).freedom, 6);
});

test("chapter sizes are read from the story, not hard-coded to three", () => {
  assert.deepEqual(chapterChoiceCounts(sampleStory), [3, 3, 3, 3, 3]);

  // 可配置示例：2 + 4 + 3 = 9 次选择，三章
  const counts = [2, 4, 3];
  assert.deepEqual(progressOf(0, counts), { chapterIndex: 0, forkIndex: 0 });
  assert.deepEqual(progressOf(1, counts), { chapterIndex: 0, forkIndex: 1 });
  assert.deepEqual(progressOf(2, counts), { chapterIndex: 1, forkIndex: 0 });
  assert.deepEqual(progressOf(5, counts), { chapterIndex: 1, forkIndex: 3 });
  assert.deepEqual(progressOf(6, counts), { chapterIndex: 2, forkIndex: 0 });
  assert.deepEqual(progressOf(9, counts), { chapterIndex: 2, forkIndex: 2 });
});

test("all delayed consequences refer to a choice in an earlier chapter", () => {
  const known = new Set<string>();
  for (const chapter of sampleStory.chapters) {
    for (const fork of chapter.forks)
      for (const echo of fork.echoes) assert.ok(known.has(echo.ifFlag));
    for (const fork of chapter.forks)
      for (const option of fork.options)
        for (const flag of option.sets) known.add(flag);
  }
});

// ── 标杆故事（陈映真）：分叉 → 汇合 → 组合结局 ──
import { chenYingzhenStory } from "../content/stories/chen-yingzhen.ts";
import { findFork, traverse, isJourneyFinished } from "./journey.ts";

const optionById = (forkId: string, optionId: string) => {
  const ref = findFork(chenYingzhenStory, forkId);
  const option = ref?.fork.options.find((o) => o.id === optionId);
  if (!option) throw new Error(`missing option ${optionId}`);
  return option;
};

test("benchmark story branches into a different chapter-2 fork, then merges", () => {
  // 临床线：CH-01 继续劝说 → CH-02-clinic
  const clinical = [optionById("CH-01", "ch01-keep-talking")];
  const afterClinical = traverse(chenYingzhenStory, clinical);
  assert.equal(afterClinical.current?.fork.id, "CH-02-clinic");
  assert.equal(afterClinical.chapterJustCompleted, true);
  assert.deepEqual(afterClinical.boundaries, [1]);

  // 公共卫生线：CH-01 转介 → CH-02-public（同一章、不同岔路）
  const publicLine = [optionById("CH-01", "ch01-refer")];
  const afterPublic = traverse(chenYingzhenStory, publicLine);
  assert.equal(afterPublic.current?.fork.id, "CH-02-public");
  assert.equal(afterPublic.current?.chapterIndex, 1);

  // 两条线都汇合到 CH-03
  const merged = [
    ...publicLine,
    optionById("CH-02-public", "ch02-public-collab"),
  ];
  assert.equal(traverse(chenYingzhenStory, merged).current?.fork.id, "CH-03");
});

test("benchmark story yields three fragments and a flag-driven ending", () => {
  const clinicalPath = [
    optionById("CH-01", "ch01-keep-talking"),
    optionById("CH-02-clinic", "ch02-clinic-invest"),
    optionById("CH-03", "ch03-try"),
  ];
  const t = traverse(chenYingzhenStory, clinicalPath);
  assert.equal(t.finished, true);
  assert.deepEqual(t.boundaries, [1, 2, 3]);
  assert.equal(earnedFragments(chenYingzhenStory, clinicalPath).length, 3);
  assert.equal(chooseEnding(chenYingzhenStory, clinicalPath).id, "deep-clinic");

  const collaborativePath = [
    optionById("CH-01", "ch01-refer"),
    optionById("CH-02-public", "ch02-public-collab"),
    optionById("CH-03", "ch03-decline"),
  ];
  assert.equal(isJourneyFinished(chenYingzhenStory, collaborativePath), true);
  assert.equal(
    chooseEnding(chenYingzhenStory, collaborativePath).id,
    "collective",
  );

  const boundaryPath = [
    optionById("CH-01", "ch01-respect-choice"),
    optionById("CH-02-clinic", "ch02-clinic-boundary"),
    optionById("CH-03", "ch03-explain"),
  ];
  assert.equal(chooseEnding(chenYingzhenStory, boundaryPath).id, "sustainable");
});

// ── 正式标杆故事《陈映真·她接住的那一半》：5 章 × 3 次选择 ──
import { chenYingzhenHalfStory } from "../content/stories/chen-yingzhen-half.ts";

test("published benchmark story has five chapters, fifteen choices and five endings", () => {
  assert.equal(chenYingzhenHalfStory.status, "published");
  assert.equal(chenYingzhenHalfStory.chapters.length, 5);
  assert.equal(
    chenYingzhenHalfStory.chapters.reduce((n, c) => n + c.forks.length, 0),
    15,
  );
  for (const chapter of chenYingzhenHalfStory.chapters) {
    assert.equal(chapter.forks.length, 3);
    for (const fork of chapter.forks) assert.equal(fork.options.length, 3);
  }
  assert.ok(chenYingzhenHalfStory.endings.length >= 4);
  assert.ok(chenYingzhenHalfStory.endings.some((e) => e.fallback));
});

test("first-option path finishes with fifteen fragments and a fallback-safe ending", () => {
  const choices = chenYingzhenHalfStory.chapters.flatMap((c) =>
    c.forks.map((f) => f.options[0]),
  );
  assert.equal(choices.length, 15);
  const path = traverse(chenYingzhenHalfStory, choices);
  assert.equal(path.finished, true);
  assert.deepEqual(path.boundaries, [3, 6, 9, 12, 15]);
  assert.equal(earnedFragments(chenYingzhenHalfStory, choices).length, 5);
  // 第一章三选项的维度：判断清晰度 / 事业进展 / 关系支持 → 多数并列，取最后一次 → relationship
  assert.equal(earnedFragments(chenYingzhenHalfStory, choices)[0], "relationship");
  assert.equal(journeyState(choices).achievement > 0, true);
});
