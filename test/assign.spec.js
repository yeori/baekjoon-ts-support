import { describe, it, assert } from "vitest";
describe("assign", () => {
  it("copy", () => {
    const target = { one: 1 };

    const out = Object.assign(target, { two: 2, three: 3 }, { two: "TWO" });

    assert.equal(out.one, 1);
    assert.equal(out.two, "TWO");
    assert.equal(out.three, 3);
  });
});
