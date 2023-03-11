import path from "path";
import console from "./console.mjs";
import util from "./util.mjs";

export const DEFAULT_FORMAT = {
  ROOT_DIR: "src",
  QUIZ_DIR: `p{}`,
  TS_FILE: `p{}.ts`,
  JS_FILE: `p{}.js`,
  TC_FILE: "{}.tc",
  QUIZ_URL: "https://www.acmicpc.net/problem/{}",
};

const loadConfig = (filePath) => {
  let config = {};
  if (filePath) {
    const absPath = path.resolve(filePath);
    if (util.file.isNull(absPath)) {
      console.printWarn(`cannot find configuration file: ${absPath}`);
    } else {
      const body = util.file.read(absPath);
      config = JSON.parse(body);
    }
  }
  const invalidProps = Object.keys(config).filter(
    (prop) => !DEFAULT_FORMAT[prop]
  );
  if (invalidProps.length > 0) {
    throw new Error("invalid props: " + invalidProps);
  }
  return config;
};
export default class BtsContext {
  constructor(configFilePath = undefined) {
    const config = loadConfig(configFilePath);
    this.config = Object.assign({}, DEFAULT_FORMAT, config);
    this.workingDir = process.cwd();
    this.jobs = [];
  }
  getWorkingDir() {
    return this.workingDir;
  }
  /**
   *
   * @param { string | number } quizId
   * @returns
   */
  getQuizUrl(quizId) {
    return this.config.QUIZ_URL.replace("{}", quizId);
  }
  getRootDir() {
    return this.config.ROOT_DIR;
  }
  /**
   *
   * @param {string|number} quizId
   */
  getQuizDir(quizId) {
    return this.config.QUIZ_DIR.replace("{}", quizId);
  }
  /**
   *
   * @param {string|number} quizId
   * @returns
   */
  getTypescriptFile(quizId) {
    return this.config.TS_FILE.replace("{}", quizId);
  }
  /**
   *
   * @param {string|number} quizId
   * @returns
   */
  getJavascriptFile(quizId) {
    return this.config.JS_FILE.replace("{}", quizId);
  }
  /**
   *
   * @param {string|number} testCaseName
   * @returns
   */
  getTestCaseFile(testCaseName) {
    return this.config.TC_FILE.replace("{}", testCaseName);
  }
  job(name, fn) {
    this.jobs.unshift({ name, fn });
  }
  rollback() {
    this.jobs.forEach((job) => {
      try {
        console.log(job.name);
        job.fn();
      } catch (err) {
        console.printError("failed");
      }
    });
  }
}
