import { List } from "./types.ts";
import { create } from "./list.ts";
import { assertEquals } from "./deps.ts";

const testData = () => {
  const li: List<string> = create();
  ["a", "b", "c"].forEach((it) => li.pushFront(it));
  return li;
};

Deno.test("list test", () => {
  const li = testData();
  assertEquals([...li].join(""), "cba");
  assertEquals([...li.values(true)].join(""), "abc");
  li.moveToFront(li.front()!);
  assertEquals([...li].join(""), "cba");
  assertEquals([...li.values(true)].join(""), "abc");
  const middle = li.front()!.next!;
  li.moveToFront(middle);
  assertEquals([...li].join(""), "bca");
  assertEquals([...li.values(true)].join(""), "acb");
  li.remove(li.front()!);
  assertEquals([...li].join(""), "ca");
  assertEquals([...li.values(true)].join(""), "ac");
  assertEquals(li.size, 2, "bad length");
});
