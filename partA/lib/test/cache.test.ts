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
test("LRU cache updates an existing key without growing size", () => {
  const cache = createCache<string, number>("lru", { capacity: 2 });
  cache.set("a", 1);
  cache.set("a", 10);
  assert.equal(cache.size(), 1);
  assert.equal(cache.get("a"), 10);
});

test("LRU delete removes entries", () => {
  const cache = createCache<string, number>("lru", { capacity: 2 });
  cache.set("a", 1);
  assert.equal(cache.delete("a"), true);
  assert.equal(cache.delete("a"), false);
  assert.equal(cache.has("a"), false);
});

test("LRU clear removes every entry", () => {
  const cache = createCache<string, number>("lru", { capacity: 2 });
  cache.set("a", 1);
  cache.set("b", 2);
  cache.clear();
  assert.equal(cache.size(), 0);
});


test("LFU cache evicts the least frequently used entry", () => {
  const cache = createCache<string, number>("lfu", { capacity: 2 });
  cache.set("a", 1);
  cache.set("b", 2);
  cache.get("a");
  cache.get("a");
  cache.set("c", 3);

  assert.equal(cache.has("a"), true);
  assert.equal(cache.has("b"), false);
  assert.equal(cache.has("c"), true);
});

test("LFU cache uses oldest touch time as tie-breaker", () => {
  const clock = createClock();
  const cache = createCache<string, number>("lfu", { capacity: 2, clock: clock.now });

  cache.set("a", 1);
  clock.advance(1);
  cache.set("b", 2);
  clock.advance(1);
  cache.set("c", 3);

  assert.equal(cache.has("a"), false);
  assert.equal(cache.has("b"), true);
  assert.equal(cache.has("c"), true);
});

test("LFU set on existing key refreshes value and frequency", () => {
  const cache = createCache<string, number>("lfu", { capacity: 2 });
  cache.set("a", 1);
  cache.get("a");
  cache.set("a", 5);
  assert.equal(cache.get("a"), 5);
  assert.equal(cache.size(), 1);
});

test("TTL cache returns value before expiry", () => {
  const clock = createClock();
  const cache = createCache<string, number>("ttl", {
    capacity: 2,
    ttlMs: 10,
    clock: clock.now
  });

  cache.set("a", 1);
  clock.advance(9);
  assert.equal(cache.get("a"), 1);
});

test("TTL cache expires values after ttl", () => {
  const clock = createClock();
  const cache = createCache<string, number>("ttl", {
    capacity: 2,
    ttlMs: 10,
    clock: clock.now
  });

  cache.set("a", 1);
  clock.advance(10);
  assert.equal(cache.get("a"), undefined);
  assert.equal(cache.size(), 0);
});

test("TTL cache has ignores expired entries", () => {
  const clock = createClock();
  const cache = createCache<string, number>("ttl", {
    capacity: 2,
    ttlMs: 5,
    clock: clock.now
  });

  cache.set("a", 1);
  clock.advance(6);
  assert.equal(cache.has("a"), false);
});

test("TTL cache delete works for live entries", () => {
  const clock = createClock();
  const cache = createCache<string, number>("ttl", {
    capacity: 2,
    ttlMs: 5,
    clock: clock.now
  });

  cache.set("a", 1);
  assert.equal(cache.delete("a"), true);
  assert.equal(cache.get("a"), undefined);
});

test("TTL cache evicts earliest expiry when full", () => {
  const clock = createClock();
  const cache = createCache<string, number>("ttl", {
    capacity: 2,
    ttlMs: 10,
    clock: clock.now
  });

  cache.set("a", 1);
  clock.advance(2);
  cache.set("b", 2);
  clock.advance(2);
  cache.set("c", 3);

  assert.equal(cache.has("a"), false);
  assert.equal(cache.has("b"), true);
  assert.equal(cache.has("c"), true);
});

test("factory rejects invalid capacity", () => {
  assert.throws(
    () => createCache<string, number>("lru", { capacity: 0 }),
    CacheConfigurationError
  );
});

test("factory rejects ttl cache without positive ttlMs", () => {
  assert.throws(
    () => createCache<string, number>("ttl", { capacity: 2, ttlMs: 0 }),
    CacheConfigurationError
  );
});

test("cache size excludes expired ttl entries", () => {
  const clock = createClock();
  const cache = createCache<string, number>("ttl", {
    capacity: 3,
    ttlMs: 5,
    clock: clock.now
  });

  cache.set("a", 1);
  cache.set("b", 2);
  clock.advance(6);
  assert.equal(cache.size(), 0);
});


