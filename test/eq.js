import { assert } from "vitest";
/**
 *
 * @param {arguments} arr
 */
export function equalsProps() {
  const arr = arguments;
  if (arr.length % 2 === 1) {
    throw new Error("invalid key-value array. even size required");
  }
  for (let k = 0; k < arr.length; k += 2) {
    const actual = arr[k];
    const expected = arr[k + 1];
    assert.equal(
      actual,
      expected,
      `assert failed at ${k} and ${
        k + 1
      }, expected [${expected}], but [${actual}]`
    );
  }
}
