import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleStory } from "../content/stories/sample.ts";
import { chooseEnding, earnedFragments, journeyState } from "./journey.ts";

test("sample supports a full fifteen-choice journey and five chapter rewards", () => {
  const choices = sampleStory.chapters.flatMap((c) =>
    c.forks.map((f) => f.options[0]),
  );
  assert.equal(choices.length, 15);
  assert.equal(earnedFragments(choices.slice(0, 2)).length, 0);
  assert.equal(earnedFragments(choices.slice(0, 3)).length, 1);
  assert.equal(earnedFragments(choices).length, 5);
  assert.equal(chooseEnding(sampleStory, choices).id, "window");
  assert.equal(journeyState(choices).freedom, 6);
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
