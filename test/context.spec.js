import { describe, it, assert, expect } from "vitest";
import BtsContext from "../src/bts-context.mjs";
import { equalsProps } from "./eq.js";

describe("context", () => {
  it("default context", () => {
    const quizId = 1000;
    const ctx = new BtsContext();
    equalsProps(
      ctx.getRootDir(),
      "src",
      ctx.getQuizDir(quizId),
      "p1000",
      ctx.getTypescriptFile(quizId),
      "p1000.ts",
      ctx.getJavascriptFile(quizId),
      "p1000.js",
      ctx.getTestCaseFile(0),
      "0.tc",
      ctx.getTestCaseFile(1),
      "1.tc"
    );
  });
  it("using config file", () => {
    console.log(process.cwd());
    const ctx = new BtsContext("test/sample-config.json");
    const quizId = 1234;
    equalsProps(
      ctx.getRootDir(),
      "src/bronze",
      ctx.getQuizDir(quizId),
      "p1234",
      ctx.getTypescriptFile(quizId),
      "index.ts",
      ctx.getJavascriptFile(quizId),
      "index.js",
      ctx.getTestCaseFile(0),
      "s0.tc",
      ctx.getTestCaseFile(1),
      "s1.tc"
    );
  });
  it("invalid properties", () => {
    console.log(process.cwd());
    expect(() => new BtsContext("test/invalid-config.json")).toThrowError();
  });
});
