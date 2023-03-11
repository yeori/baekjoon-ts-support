import { load } from "cheerio";
import spawn from "cross-spawn";
import path from "path";
import util from "./util.mjs";
import BtsProject from "./project.mjs";
import console from "./console.mjs";

const NEW_LINE = "\n";
export const BJ_BODY_SELECTOR = "body > .wrapper > .content #problem-body";

const DASH = "=====";
const HEADER_DESC = `${DASH}DESCRIPTION${DASH}`;
const HEADER_INPUT = `${DASH}INPUT${DASH}`;
const HEADER_OUTPUT = `${DASH}OUTPUT${DASH}`;
const HEADER_DONE = `${DASH}DONE${DASH}`;

const validHeaders = new Set();
validHeaders.add(HEADER_DESC);
validHeaders.add(HEADER_INPUT);
validHeaders.add(HEADER_OUTPUT);
validHeaders.add(HEADER_DONE);
/**
 *
 * @param  {...string} headers
 */
const checkHeaders = (...headers) => {
  headers.forEach((h) => {
    if (!validHeaders.has(h)) {
      throw new Error(`header [${h}] is not defined.`);
    }
  });
};
export class Sample {
  /**
   *
   * @param {BtsProject} project
   * @param {number} order
   * @param {string} fileName
   * @param {string} input
   * @param {string} output
   * @param {string} description
   */
  constructor(project, order, fileName, input, output, description) {
    this.project = project;
    this.order = order;
    this.fileName = fileName;
    this.input = input;
    this.output = output;
    this.description = description;
    this.actual = null;
  }
  get filePath() {
    return path.resolve(this.project.projectDir, this.fileName);
  }
  get projectDir() {
    return this.project.projectDir;
  }
  getFilePath() {
    const { workingDir } = this.project;
    return path.relative(workingDir, this.filePath);
  }
  read() {
    const content = util.file.read(this.filePath);
    decodeSample(content, this);
  }
  run() {
    const proc = spawn("bash", {});

    const body = {
      out: [],
      err: [],
    };
    proc.stdout.on("data", (chunk) => {
      body.out.push(chunk);
    });
    proc.stdout.on("close", () => {
      // console.print(body.out.join(""));
    });

    proc.stderr.on("data", (chunk) => {
      body.err.push(chunk);
    });
    proc.stderr.on("end", () => {
      if (body.err.length > 0) {
        console.printError(body.err.join(""));
      }
    });
    proc.stdin.write(
      `echo "${this.input}" | node ${this.project.javascriptFile}`
    );
    proc.stdin.end();

    proc.on("close", (code) => {
      this.actual = body.out.join("").trim();
      const method = this.actual === this.output ? "success" : "failed";
      console.testcase[method](
        `file: ${this.fileName}, expected: [${this.output}], actual: [${this.actual}]`
      );
    });
  }
}

const write = (lines, header, value) => {
  lines.push(header);
  if (value) {
    lines.push(value);
  }
};

const encodeSample = (sample) => {
  const body = [];
  const { description, input, output } = sample;
  write(body, HEADER_DESC, description);
  write(body, HEADER_INPUT, input);
  write(body, HEADER_OUTPUT, output);
  write(body, HEADER_DONE, null);

  util.file.create(sample.fileName, sample.projectDir, body.join(NEW_LINE));
};
/**
 *
 * @param {string} s
 * @param {string} h0
 * @param {string} h1
 */
const textBetween = (str, h0, h1) => {
  checkHeaders(h0, h1);
  const s = str.indexOf(h0);
  const e = str.indexOf(h1);
  if (s < 0) {
    throw new Error("[TC FORMAT]", `cannot find header [${h0}]`);
  }
  if (e < 0) {
    throw new Error("[TC FORMAT]", `cannot find header [${h1}]`);
  }
  if (s + h0.length > e) {
    throw new Error(
      "[TC FORMAT]",
      `header position error: ${h0} at ${s}, ${h1} at ${e}`
    );
  }
  const text = str.substring(s + h0.length, e);
  return text.trim();
};
const decodeSample = (content, sample) => {
  const desc = textBetween(content, HEADER_DESC, HEADER_INPUT);
  const input = textBetween(content, HEADER_INPUT, HEADER_OUTPUT);
  const output = textBetween(content, HEADER_OUTPUT, HEADER_DONE);
  sample.input = input;
  sample.output = output;
  sample.description = desc;
};
/**
 * @param {string} html
 * @param {BtsProject} project
 */
const parseSamples = (html, project) => {
  /**
   * #problem-body
   *   +- #sampleinput1, #sampleoutput1
   *   +- #sampleinput2, #sampleoutput2
   *      ....
   *   +- #sampleinputK, #sampleoutputK
   */
  const api = load(html);
  const $el = api(BJ_BODY_SELECTOR);
  let order = 1;
  let $in = api(`#sampleinput${order}`, $el);
  let $out = api(`#sampleoutput${order}`, $el);
  const samples = [];
  while ($in.length > 0 && $out.length > 0) {
    const input = api("pre", $in).text().trim();
    const output = api("pre", $out).text().trim();
    const fileName = project.ctx.getTestCaseFile(order);
    const desc = `SAMPLE ${order}\n${project.url}`;
    const sample = new Sample(project, order, fileName, input, output, desc);
    samples.push(sample);
    order++;
    $in = api(`#sampleinput${order}`, $el);
    $out = api(`#sampleoutput${order}`, $el);
  }
  return samples;
};
/**
 *
 * @param {Sample} sample
 */
export function fetchSamples(project) {
  return util.remote.get(project.url).then((html) => {
    const samples = parseSamples(html, project);
    samples.forEach((sample) => {
      encodeSample(sample);
    });
    return samples;
  });
}
