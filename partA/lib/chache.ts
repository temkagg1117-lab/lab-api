export type CachePolicy = "lru" | "lfu" | "ttl";

export interface CacheOptions {
  capacity?: number;
  ttlMs?: number;
  clock?: () => number;
}

export class CacheError extends Error {
  public constructor(message: string) {
    super(message);
    this.name = "CacheError";
  }
}

export class CacheConfigurationError extends CacheError {
  public constructor(message: string) {
    super(message);
    this.name = "CacheConfigurationError";
  }
}

export interface Cache<K, V> {
  /**
   * Stores or replaces a value for the given key.
   *
   * Preconditions:
   * - `key` must be a valid key for the selected cache implementation.
   * - The cache instance must have been created with valid configuration.
   *
   * Postconditions:
   * - `get(key)` returns `value` unless the entry is later evicted or expires.
   * - The cache size may stay the same or increase by one.
   *
   * Error conditions:
   * - Throws `CacheError` when the cache is closed or unusable.
   */
  set(key: K, value: V): void;

  /**
   * Reads the value stored for a key.
   *
   * Preconditions:
   * - `key` must be a valid key for the selected cache implementation.
   *
   * Postconditions:
   * - Returns the stored value when present and valid.
   * - Returns `undefined` when the key is missing or expired.
   *
   * Error conditions:
   * - Throws `CacheError` when the cache is closed or unusable.
   */
  get(key: K): V | undefined;

  /**
   * Checks whether a non-expired entry exists for a key.
   *
   * Preconditions:
   * - `key` must be a valid key for the selected cache implementation.
   *
   * Postconditions:
   * - Returns `true` only when a live entry is currently stored for `key`.
   *
   * Error conditions:
   * - Throws `CacheError` when the cache is closed or unusable.
   */
  has(key: K): boolean;

  /**
   * Removes the entry associated with a key.
   *
   * Preconditions:
   * - `key` must be a valid key for the selected cache implementation.
   *
   * Postconditions:
   * - Returns `true` when an entry was removed.
   * - Returns `false` when the key was absent.
   *
   * Error conditions:
   * - Throws `CacheError` when the cache is closed or unusable.
   */
  delete(key: K): boolean;

  /**
   * Removes all entries from the cache.
   *
   * Preconditions:
   * - None.
   *
   * Postconditions:
   * - `size()` returns `0`.
   * - All previous keys behave as missing.
   *
   * Error conditions:
   * - Throws `CacheError` when the cache is closed or unusable.
   */
  clear(): void;

  /**
   * Returns the current number of live entries.
   *
   * Preconditions:
   * - None.
   *
   * Postconditions:
   * - The returned number is greater than or equal to `0`.
   * - Expired TTL entries are not counted.
   *
   * Error conditions:
   * - Throws `CacheError` when the cache is closed or unusable.
   */
  size(): number;
}

import { createHiddenCache } from "./internal/caches.ts";

/**
 * Creates a cache instance while hiding the concrete implementation type.
 *
 * Preconditions:
 * - `policy` must be one of `"lru"`, `"lfu"`, or `"ttl"`.
 * - `options.capacity` must be a positive integer when provided.
 * - `options.ttlMs` must be a positive integer for the `"ttl"` policy.
 *
 * Postconditions:
 * - Returns an object implementing the public `Cache<K, V>` interface.
 * - The returned value never exposes the concrete cache class.
 *
 * Error conditions:
 * - Throws `CacheConfigurationError` when the policy options are invalid.
 */
export function createCache<K, V>(
  policy: CachePolicy,
  options: CacheOptions = {}
): Cache<K, V> {
  return createHiddenCache<K, V>(policy, options);
}
