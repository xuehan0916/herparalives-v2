import { test } from "node:test";
import assert from "node:assert/strict";
import { canExchange, chapterFragment, completeStory, emptyWallet, exchange, refundCredit, spendCredit } from "./fragments.ts";

test("chapter drops the dimension chosen most often", () => {
  assert.equal(chapterFragment(["freedom", "self", "freedom"]), "freedom");
  assert.equal(chapterFragment(["self", "self", "self"]), "self");
});

test("all three different: the last choice wins", () => {
  assert.equal(chapterFragment(["freedom", "self", "achievement"]), "achievement");
});

test("five different kinds exchange for one credit, extras are kept", () => {
  let w = completeStory(emptyWallet(), ["stability", "freedom", "achievement", "relationship", "self"]).wallet;
  w = completeStory(w, ["self"]).wallet;
  assert.ok(canExchange(w));
  w = exchange(w);
  assert.equal(w.credits, 1);
  assert.equal(w.fragments.self, 1);
  assert.equal(w.fragments.freedom, 0);
  assert.equal(w.storiesSinceUnlock, 0);
  assert.ok(!canExchange(w));
});

test("exchange without a full set does nothing", () => {
  const w = completeStory(emptyWallet(), ["self", "self"]).wallet;
  assert.deepEqual(exchange(w), w);
});

test("every 4 finished stories unlock one even without a full set", () => {
  let w = emptyWallet();
  const results = [];
  for (let i = 0; i < 8; i++) {
    const r = completeStory(w, ["self", "self", "self", "self", "self"]);
    results.push(r.guaranteed);
    w = r.wallet;
  }
  assert.deepEqual(results, [false, false, false, true, false, false, false, true]);
  assert.equal(w.credits, 2);
});

test("spending and refunding credits", () => {
  let w = { ...emptyWallet(), credits: 1 };
  w = spendCredit(w);
  assert.equal(w.credits, 0);
  assert.throws(() => spendCredit(w));
  assert.equal(refundCredit(w).credits, 1);
});
