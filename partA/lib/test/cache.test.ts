import test from "node:test";
import assert from "node:assert/strict";

import { CacheConfigurationError, createCache } from "../cache.ts";

function createClock(start = 0): { now: () => number; advance: (ms: number) => void } {
  let current = start;
  return {
    now: () => current,
    advance: (ms: number) => {
      current += ms;
    }
  };
}

test("LRU cache stores and reads values", () => {
  const cache = createCache<string, number>("lru", { capacity: 2 });
  cache.set("a", 1);
  assert.equal(cache.get("a"), 1);
});
test("LRU cache evicts the least recently used entry", () => {
  const clock = createClock();
  const cache = createCache<string, number>("lru", { capacity: 2, clock: clock.now });

  cache.set("a", 1);
  clock.advance(1);
  cache.set("b", 2);
  clock.advance(1);
  cache.get("a");
  clock.advance(1);
  cache.set("c", 3);

  assert.equal(cache.has("a"), true);
  assert.equal(cache.has("b"), false);
  assert.equal(cache.has("c"), true);
});
