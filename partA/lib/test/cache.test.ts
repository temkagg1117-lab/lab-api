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