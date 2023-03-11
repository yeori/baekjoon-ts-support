#!/usr/bin/env node

import parseArgs from "minimist";
import BtsProject from "../project.mjs";
// import build from "../build.js";
const quizPrefix = "https://www.acmicpc.net/problem/";
const props = "init,compile,run,skip-compile,test,tc"
  .split(",")
  .map((prop) => `--${prop}`);

const languages = {
  bts: "ts",
  bjs: "js",
};
/**
 * bts: typescript
 * bjs: javascript
 */
const cmd = process.argv[1].split("/").reverse()[0];
const lang = languages[cmd];
if (!lang) {
  throw new Error(`invalid command [${cmd}]. [bts, bjs] are possible.`);
}

const args = parseArgs(process.argv, {
  string: ["init", "compile", "tc"],
  boolean: ["skip-compile"],
  default: {
    compile: null,
    init: null,
    tc: null,
    test: null,
    "skip-compile": false,
  },
  unknown: (name) => props.includes(name),
});
// console.log(args);
/**
 *
 * @param {string} value
 */
const parseQuizId = (value) => {
  if (value.startsWith(quizPrefix)) {
    return value.substring(quizPrefix.length);
  } else {
    return value;
  }
};

if (lang === "js") {
  args["skip-compile"] = true;
}
if (args.init) {
  const quizNum = parseQuizId(args.init);
  const prj = new BtsProject("src", { quizId: quizNum, lang });
  prj.install();
} else if (args.compile) {
  const prj = new BtsProject("src", { quizId: args.compile, lang });
  prj.validate();
  prj.compile();
} else if (args.test) {
  const prj = new BtsProject("src", { quizId: args.test, lang });
  if (!args["skip-compile"]) {
    prj.compile();
  }
  if (prj.validate()) {
    prj.loadSamples(args.tc).then(() => {
      prj.run();
    });
  }
}
