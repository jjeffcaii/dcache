import { List, LRU, Node } from "./types.ts";
import { create as createList } from "./list.ts";

interface Pair<K, V> {
  key: K;
  value: V;
}

class LRUImpl<K, V> implements LRU<K, V> {
  #visits: List<Pair<K, V>> = createList();
  #dict: Map<K, Node<Pair<K, V>>> = new Map();
  #expires?: Map<K, number>;
  #cap: number;

  constructor(cap: number) {
    this.#cap = cap;
  }

  private isExpired(key: K): boolean {
    const expiredAt = this.#expires?.get(key);
    if (expiredAt === undefined) return false;
    return expiredAt < Date.now();
  }

  private kickout(node: Node<Pair<K, V>>) {
    this.#dict.delete(node.value.key);
    this.#visits.remove(node);
    this.#expires?.delete(node.value.key);
  }

  private *iterKeys() {
    for (const { key } of this.#visits) {
      if (!this.isExpired(key)) yield key;
    }
  }

  private *iterValues() {
    for (const { key, value } of this.#visits) {
      if (!this.isExpired(key)) yield value;
    }
  }

  get size(): number {
    if (!this.#expires?.size) return this.#dict.size;
    let cnt = 0;
    for (const k of this.#dict.keys()) {
      if (!this.isExpired(k)) {
        cnt++;
      }
    }
    return cnt;
  }

  forEach(callback: (value: V, key: K) => void) {
    let cur = this.#visits.front();
    while (cur) {
      const { key, value } = cur.value;
      if (!this.isExpired(key)) {
        callback(value, key);
      }
      cur = cur.next;
    }
  }

  keys(): Iterable<K> {
    return this.iterKeys();
  }

  values(): Iterable<V> {
    return this.iterValues();
  }

  set(key: K, value: V, ttlMills?: number) {
    const exist = this.#dict.get(key);
    if (!exist) {
      this.insert(key, value, ttlMills);
      return;
    }
    if (!this.isExpired(key)) {
      exist.value.value = value;
      if (ttlMills && ttlMills > 0) {
        if (!this.#expires) {
          this.#expires = new Map();
        }
        this.#expires!.set(key, Date.now() + (ttlMills << 0));
      } else {
        this.#expires?.delete(key);
      }
      this.#visits.moveToFront(exist);
      return;
    }
    this.kickout(exist);
    this.insert(key, value, ttlMills);
  }

  private insert(key: K, value: V, ttlMills?: number) {
    const node = this.#visits.pushFront({ key, value });
    this.#dict.set(key, node);
    if (ttlMills && ttlMills > 0) {
      if (!this.#expires) {
        this.#expires = new Map();
      }
      this.#expires!.set(key, Date.now() + (ttlMills << 0));
    }

    const overflow = this.#visits.size > this.#cap;
    if (!overflow) return;

    if (!this.#expires?.size) {
      this.shrink();
      return;
    }

    let expiredKey;
    for (const [k, expiredAt] of this.#expires!) {
      if (expiredAt < Date.now()) {
        expiredKey = k;
        break;
      }
    }

    if (expiredKey) {
      this.delete(expiredKey);
    } else {
      this.shrink();
    }
  }

  private shrink() {
    const tail = this.#visits.back();
    if (tail) {
      this.#dict.delete(tail.value.key);
      this.#visits.remove(tail);
    }
  }

  has(key: K): boolean {
    const exist = this.#dict.get(key);
    if (!exist) return false;
    const expired = this.isExpired(key);
    if (expired) {
      this.kickout(exist);
    }
    return !expired;
  }

  get(key: K): V | undefined {
    const exist = this.#dict.get(key);
    if (!exist) return undefined;
    if (this.isExpired(key)) {
      this.kickout(exist);
      return undefined;
    }
    this.#visits.moveToFront(exist);
    return exist?.value?.value;
  }

  delete(key: K): boolean {
    const deleted = this.#dict.get(key);
    if (deleted === undefined) return false;
    this.kickout(deleted);
    return true;
  }

  public toString = (): string => {
    return JSON.stringify({
      expires: this.#expires?.size || 0,
      visits: this.#visits.size,
      dict: this.#dict.size,
    });
  };
}

export function create<K, V>(cap: number): LRU<K, V> {
  if (cap < 1) {
    throw new Error(`invalid LRU cap: ${cap}!`);
  }
  return new LRUImpl(cap);
}
