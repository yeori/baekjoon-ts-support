import fs from "fs";
import * as cheer from "cheerio";

import { BJ_BODY_SELECTOR } from "../src/cli/sample.mjs";
import util from "../src/util.mjs";

const html = fs.readFileSync("test/sample.html").toString();

const $ = cheer.load(html);
const $body = $(BJ_BODY_SELECTOR);
// console.log("[$]", $body);
const samples = util.remote.bj.parseSamples($, $body);

console.log(samples);
