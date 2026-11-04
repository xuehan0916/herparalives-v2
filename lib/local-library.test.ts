import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleStory } from "../content/stories/sample.ts";
import {
  parseLibrary,
  restoreJourney,
  summarizeLibrary,
  upsertJourney,
  type JourneyRecord,
} from "./local-library.ts";
const options = sampleStory.chapters.flatMap((c) =>
  c.forks.map((f) => f.options[0]),
);
const record = (count: number, id = "run-a"): JourneyRecord => ({
  id,
  storyId: sampleStory.id,
  choiceIds: options.slice(0, count).map((o) => o.id),
  updatedAt: "2026-11-04T10:00:00.000Z",
});

test("autosaving a journey replaces progress without multiplying its chapter fragments", () => {
  let records = upsertJourney([], record(3));
  records = upsertJourney(records, record(6));
  assert.equal(records.length, 1);
  const summary = summarizeLibrary(records, [sampleStory]);
  assert.equal(summary.totalFragments, 2);
  assert.equal(summary.completed, 0);
  assert.equal(summary.journeys[0].choices.length, 6);
});
test("separate playthroughs aggregate earned fragments and completed journeys", () => {
  const summary = summarizeLibrary(
    [record(15), record(3, "run-b")],
    [sampleStory],
  );
  assert.equal(summary.totalFragments, 6);
  assert.equal(summary.completed, 1);
  assert.equal(summary.journeys.length, 2);
});
test("corrupt, unknown and out-of-order records do not grant rewards or resume a wrong story", () => {
  assert.deepEqual(parseLibrary("{broken"), []);
  assert.deepEqual(
    parseLibrary(
      JSON.stringify([
        { ...record(3), choiceIds: ["x"], updatedAt: "invalid" },
      ]),
    ),
    [],
  );
  assert.equal(
    restoreJourney({ ...record(3), storyId: "missing" }, [sampleStory]),
    undefined,
  );
  assert.equal(
    restoreJourney({ ...record(3), choiceIds: [options[2].id] }, [sampleStory]),
    undefined,
  );
  assert.equal(
    summarizeLibrary([{ ...record(3), choiceIds: ["unknown"] }], [sampleStory])
      .totalFragments,
    0,
  );
});
