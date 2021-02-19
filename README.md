# Deno Cache - dcache :t-rex:

![GitHub Workflow Status](https://github.com/jjeffcaii/dcache/workflows/Deno/badge.svg)
![License](https://img.shields.io/github/license/jjeffcaii/dcache.svg)
[![GitHub Release](https://img.shields.io/github/release-pre/jjeffcaii/dcache.svg)](https://github.com/jjeffcaii/dcache/releases)

A simple Deno LRU cache utilities.

## Example

```typescript
import { create, LRU } from "https://deno.land/x/dcache/mod.ts";

// Create a LRU with cap 3.
const lru: LRU<string, number> = create(3);

// Set key/value
lru.set("foo", 42);
lru.set("bar", 1024, 1000); // with 1s ttl
lru.set("baz", 2048);

console.log(lru.get("foo")); // print: 42

console.log(lru.get("bar")); // print: 1024
await new Promise((res) => setTimeout(res, 1000)); // sleep 1s
console.log(lru.has("bar")); // print: false

lru.set("aaa", 777);
lru.set("bbb", 888);

// Discards the least recently used item which is "baz"
console.log(lru.get("baz")); // print: undefined

console.log([...lru.keys()].join(",")); // print: bbb,aaa,foo

lru.forEach((v, k) => console.log(`${k}=${v}`));
// print:
// bbb=888
// aaa=777
// foo=42

```
