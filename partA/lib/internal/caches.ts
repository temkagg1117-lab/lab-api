import { CacheConfigurationError } from "../cache.ts";
import type { Cache, CacheOptions, CachePolicy } from "../cache.ts";

type Entry<V> = {
  value: V;
  touchedAt: number;
  frequency: number;
  expiresAt?: number;
};

abstract class BaseCache<K, V> implements Cache<K, V> {
  protected readonly entries = new Map<K, Entry<V>>();

  protected readonly capacity: number;

  protected readonly clock: () => number;

  protected constructor(options: CacheOptions) {
    this.capacity = options.capacity ?? 100;
    this.clock = options.clock ?? (() => Date.now());

    if (!Number.isInteger(this.capacity) || this.capacity <= 0) {
      throw new CacheConfigurationError("capacity must be a positive integer");
    }
  }

  public set(key: K, value: V): void {
    this.purgeExpired();

    const current = this.entries.get(key);
    if (current !== undefined) {
      this.entries.set(key, this.nextEntry(value, current.frequency));
      this.afterRead(key);
      return;
    }

    if (this.entries.size >= this.capacity) {
      const evictionKey = this.chooseEvictionKey();
      if (evictionKey !== undefined) {
        this.entries.delete(evictionKey);
      }
    }

    this.entries.set(key, this.nextEntry(value, 1));
  }

  public get(key: K): V | undefined {
    this.purgeExpired();
    const entry = this.entries.get(key);
    if (entry === undefined) {
      return undefined;
    }

    this.afterRead(key);
    return this.entries.get(key)?.value;
  }

  public has(key: K): boolean {
    this.purgeExpired();
    return this.entries.has(key);
  }

  public delete(key: K): boolean {
    this.purgeExpired();
    return this.entries.delete(key);
  }

  public clear(): void {
    this.entries.clear();
  }

  public size(): number {
    this.purgeExpired();
    return this.entries.size;
  }

  protected nextEntry(value: V, frequency: number): Entry<V> {
    return {
      value,
      touchedAt: this.clock(),
      frequency,
      expiresAt: this.computeExpiry()
    };
  }

  protected computeExpiry(): number | undefined {
    return undefined;
  }

  protected purgeExpired(): void {
    const now = this.clock();
    for (const [key, entry] of this.entries) {
      if (entry.expiresAt !== undefined && entry.expiresAt <= now) {
        this.entries.delete(key);
      }
    }
  }

  protected afterRead(key: K): void {
    const entry = this.entries.get(key);
    if (entry === undefined) {
      return;
    }

    entry.touchedAt = this.clock();
    entry.frequency += 1;
  }

  protected abstract chooseEvictionKey(): K | undefined;
}

class LruCache<K, V> extends BaseCache<K, V> {
  protected override chooseEvictionKey(): K | undefined {
    let candidateKey: K | undefined;
    let oldestTouch = Number.POSITIVE_INFINITY;

    for (const [key, entry] of this.entries) {
      if (entry.touchedAt < oldestTouch) {
        oldestTouch = entry.touchedAt;
        candidateKey = key;
      }
    }

    return candidateKey;
  }
}

class LfuCache<K, V> extends BaseCache<K, V> {
  protected override chooseEvictionKey(): K | undefined {
    let candidateKey: K | undefined;
    let smallestFrequency = Number.POSITIVE_INFINITY;
    let oldestTouch = Number.POSITIVE_INFINITY;

    for (const [key, entry] of this.entries) {
      if (
        entry.frequency < smallestFrequency
        || (entry.frequency === smallestFrequency && entry.touchedAt < oldestTouch)
      ) {
        smallestFrequency = entry.frequency;
        oldestTouch = entry.touchedAt;
        candidateKey = key;
      }
    }

    return candidateKey;
  }
}

class TtlCache<K, V> extends BaseCache<K, V> {
  readonly #ttlMs: number;

  public constructor(options: CacheOptions) {
    super(options);

    this.#ttlMs = options.ttlMs ?? 0;
    if (!Number.isInteger(this.#ttlMs) || this.#ttlMs <= 0) {
      throw new CacheConfigurationError("ttlMs must be a positive integer for ttl cache");
    }
  }

  protected override computeExpiry(): number {
    return this.clock() + this.#ttlMs;
  }

  protected override chooseEvictionKey(): K | undefined {
    let candidateKey: K | undefined;
    let nearestExpiry = Number.POSITIVE_INFINITY;

    for (const [key, entry] of this.entries) {
      const expiry = entry.expiresAt ?? Number.POSITIVE_INFINITY;
      if (expiry < nearestExpiry) {
        nearestExpiry = expiry;
        candidateKey = key;
      }
    }

    return candidateKey;
  }

  protected override afterRead(key: K): void {
    const entry = this.entries.get(key);
    if (entry === undefined) {
      return;
    }

    entry.touchedAt = this.clock();
  }
}

export function createHiddenCache<K, V>(
  policy: CachePolicy,
  options: CacheOptions
): Cache<K, V> {
  switch (policy) {
    case "lru":
      return new LruCache<K, V>(options);
    case "lfu":
      return new LfuCache<K, V>(options);
    case "ttl":
      return new TtlCache<K, V>(options);
    default:
      throw new CacheConfigurationError(`Unsupported cache policy: ${String(policy)}`);
  }
}
