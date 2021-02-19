export interface LRU<K, V> {
  set(key: K, value: V, ttlMills?: number): void;
  has(key: K): boolean;
  get(key: K): V | undefined;
  delete(key: K): boolean;
  keys(): Iterable<K>;
  values(): Iterable<V>;
  forEach(callback: (value: V, key: K) => void): void;
  readonly size: number;
}

export interface Node<T> {
  value: T;
  next?: Node<T>;
  prev?: Node<T>;
}

export interface List<T> {
  readonly size: number;
  front(): Node<T> | undefined;
  back(): Node<T> | undefined;
  remove(node: Node<T>): void;
  pushBack(value: T): void;
  pushFront(value: T): Node<T>;
  moveToFront(node: Node<T>): void;
  moveToBack(node: Node<T>): void;
  [Symbol.iterator](): Iterator<T>;
  values(reverse?: boolean): Iterable<T>;
}
