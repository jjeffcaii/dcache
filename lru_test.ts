import { assertEquals } from "./deps.ts";
import { create, LRU } from "./mod.ts";

Deno.test("lru", () => {
  const lru: LRU<string, number> = create(3);
  ["foo", "bar", "baz", "qux"].forEach((v, i) => lru.set(v, i));
  assertEquals(lru.get("qux"), 3, "bad qux");
  assertEquals(lru.get("baz"), 2, "bad baz");
  assertEquals(lru.get("bar"), 1, "bad bar");
  assertEquals(lru.get("foo"), undefined, "bad foo");
  lru.get("qux");
  lru.set("foo", 333);
  assertEquals(lru.get("foo"), 333);
  assertEquals(lru.get("baz"), undefined);
});

Deno.test("lru - expire", async () => {
  const cache: LRU<string, number> = create(100);
  cache.set("foo", 333, 1000);
  cache.set("bar", 444);
  assertEquals(cache.get("foo"), 333, "bad foo value");
  assertEquals(cache.get("bar"), 444, "bad bar value");
  await new Promise((res) => setTimeout(res, 500));
  assertEquals(cache.get("foo"), 333, "bad foo value2");
  assertEquals(cache.has("foo"), true, `should has "foo"`);
  assertEquals(cache.has("bar"), true, `should has "bar"`);
  await new Promise((res) => setTimeout(res, 600));
  assertEquals(cache.get("foo"), undefined, "should be undefined");
  assertEquals(cache.has("foo"), false, "should be false");
  cache.forEach((v, k) => {
    console.log(`${k}=${v}`);
  });
});

Deno.test("lru - insert repeat", async () => {
  const lru: LRU<string, number> = create(3);
  lru.set("foo", 111, 1000);
  assertEquals(lru.get("foo"), 111);
  await new Promise((res) => setTimeout(res, 1000));
  lru.set("foo", 222);
  assertEquals(lru.get("foo"), 222);
  assertEquals(lru.size, 1);
});

Deno.test("lru - insert expired", async () => {
  const lru: LRU<string, number> = create(3);
  lru.set("foo", 1);
  lru.set("bar", 1, 1000);
  lru.set("baz", 1);
  await new Promise((res) => setTimeout(res, 1000));
  lru.set("qux", 1);
  console.log(`${lru}`);
  assertEquals([...lru.keys()].join(","), "qux,baz,foo");
  lru.get("foo");
  lru.set("xxx", 1);
  assertEquals([...lru.keys()].join(","), "xxx,foo,qux");
});
