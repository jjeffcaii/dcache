import { List, Node } from "./types.ts";

class ListImpl<T> implements List<T> {
  #head?: Node<T>;
  #tail?: Node<T>;
  #size = 0;

  get size(): number {
    return this.#size;
  }

  front(): Node<T> | undefined {
    return this.#head;
  }

  back(): Node<T> | undefined {
    return this.#tail;
  }

  remove(node: Node<T>) {
    const isTail = node === this.#tail;
    const isHead = node === this.#head;
    if (isTail && isHead) {
      this.#head = undefined;
      this.#tail = undefined;
    } else if (isTail) {
      node.prev!.next = undefined;
      this.#tail = node.prev;
    } else if (isHead) {
      this.#head = node.next;
      node.next!.prev = undefined;
    } else {
      node.prev!.next = node.next;
      node.next!.prev = node.prev;
    }

    node.prev = undefined;
    node.next = undefined;
    this.#size--;
  }

  pushFront(value: T): Node<T> {
    const node: Node<T> = { value };
    if (this.#size === 0) {
      this.#head = node;
      this.#tail = node;
    } else {
      node.next = this.#head;
      this.#head!.prev = node;
      this.#head = node;
    }
    this.#size++;
    return node;
  }

  pushBack(value: T) {
    const node: Node<T> = { value };
    if (this.#size === 0) {
      this.#head = node;
      this.#tail = node;
    } else {
      this.#tail!.next = node;
      node.prev = this.#tail;
      this.#tail = node;
    }
    this.#size++;
  }

  moveToFront(node: Node<T>) {
    if (this.#size === 0) throw new Error("current list contains nothing!");
    if (node === this.#head) return;

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;

    if (node === this.#tail) this.#tail = node.prev;

    node.next = this.#head;
    node.prev = undefined;
    this.#head!.prev = node;
    this.#head = node;
  }

  moveToBack(node: Node<T>): void {
    if (this.#size === 0) throw new Error("current list contains nothing!");
    if (node === this.#tail) return;

    if (node.prev) node.prev.next = node.next;
    if (node.next) node.next.prev = node.prev;

    if (node === this.#head) this.#head = node.next;

    node.next = undefined;
    node.prev = this.#tail;
    this.#tail!.next = node;
    this.#tail = node;
  }

  [Symbol.iterator](): Iterator<T> {
    return this.iter();
  }

  values(reverse = false): Iterable<T> {
    return reverse ? this.iterReverse() : this.iter();
  }

  private *iterReverse() {
    let cur = this.#tail;
    while (cur) {
      yield cur.value;
      cur = cur.prev;
    }
  }

  private *iter() {
    let cursor = this.#head;
    while (cursor) {
      yield cursor.value;
      cursor = cursor.next;
    }
  }
}

export function create<T>(): List<T> {
  return new ListImpl();
}
