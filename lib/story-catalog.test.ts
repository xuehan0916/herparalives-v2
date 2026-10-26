import { test } from "node:test";
import assert from "node:assert/strict";
import { sampleStory } from "../content/stories/sample.ts";
import {
  filterCatalog,
  drawStory,
  type CatalogEntry,
} from "./story-catalog.ts";

const work: CatalogEntry = {
  story: sampleStory,
  categories: ["work", "identity"],
};
const family: CatalogEntry = {
  story: {
    ...sampleStory,
    id: "another-story",
    card: { ...sampleStory.card, name: "另一位女性", tagline: "家里的灯" },
  },
  categories: ["family"],
};

test("situation categories can overlap and do not duplicate a story in all results", () => {
  assert.equal(filterCatalog([work, family]).length, 2);
  assert.deepEqual(filterCatalog([work, family], { category: "identity" }), [
    work,
  ]);
  assert.deepEqual(
    filterCatalog([work, family], { category: "relationships" }),
    [],
  );
});
test("search combines category, source and keywords; whitespace resets search", () => {
  assert.deepEqual(
    filterCatalog([work, family], {
      query: "  林遥   创作  ",
      category: "work",
      kind: "ordinary",
    }),
    [work],
  );
  assert.deepEqual(
    filterCatalog([work, family], { query: "林遥", category: "family" }),
    [],
  );
  assert.deepEqual(filterCatalog([work], { kind: "inspired" }), []);
  assert.equal(filterCatalog([work, family], { query: "   " }).length, 2);
});
test("drawing respects the visible pool and prefers published content to a sample", () => {
  const published: CatalogEntry = {
    ...family,
    story: { ...family.story, status: "published" },
  };
  assert.equal(
    drawStory([work, published], () => 0),
    published,
  );
  assert.equal(
    drawStory(filterCatalog([work, family], { category: "family" }), () => 0),
    family,
  );
  assert.equal(
    drawStory([], () => 0),
    undefined,
  );
});
