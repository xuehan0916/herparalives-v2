import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveGameScreen } from "./game-navigation.ts";

test("a stale browser entry cannot open a chapter reward without a finished chapter", () => {
  assert.equal(resolveGameScreen("chapter", 0, 15), "situation");
  assert.equal(resolveGameScreen("chapter", 1, 15), "read");
  assert.equal(resolveGameScreen("chapter", 3, 15), "chapter");
});
test("completed journeys never resume on an additional choice; incomplete endings return to play", () => {
  assert.equal(resolveGameScreen("read", 15, 15), "ending");
  assert.equal(resolveGameScreen("ending", 5, 15), "read");
  assert.equal(resolveGameScreen("ending", 6, 15), "chapter");
  assert.equal(resolveGameScreen("hall", 15, 15), "hall");
  assert.equal(resolveGameScreen("invalid", 0, 15), "home");
});
