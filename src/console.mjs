import chalk from "chalk";
import BtsProject from "./project.mjs";

const style = {
  success: chalk.green,
  error: chalk.red,
  warn: chalk.yellow,
  font: {
    green: chalk.green,
    red: chalk.red,
  },
  tc: {
    success: chalk.bgGreen,
    failed: chalk.bgRed,
  },
};
/**
 *
 * @param { BtsProject } prj
 */
const printProject = (prj) => {
  console.log(prj.workingDir);
  console.log(`[${style.success("OK")}]`, prj.getProjectDir(true));
  console.log(`[${style.success("OK")}]`, prj.getGeneratedScriptFile(true));
  const { samples } = prj;
  if (samples.length > 0) {
    console.log(`[${style.success("OK")}]`, `${samples.length} samples`);
  }
  samples.forEach((sample) => {
    console.log(`    `, sample.getFilePath());
  });
};

const printError = (msg, label = "ERROR") =>
  console.log(style.error(`[${label}]`), msg);
const printWarn = (msg, label = " WARN") =>
  console.log(style.warn(`[${label}]`), msg);

const testcase = {
  success: (msg) =>
    console.log(style.tc.success("PASS"), style.font.green(msg)),
  failed: (msg) => console.log(style.tc.failed("FAIL"), style.font.red(msg)),
};
export default {
  project: printProject,
  printError,
  printWarn,
  testcase,
};
