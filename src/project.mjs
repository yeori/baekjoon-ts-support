import path from "path";
import ts from "typescript";
import { glob } from "glob";
import util from "./util.mjs";
import { Sample, fetchSamples } from "./sample.mjs";
import { injectCode } from "./template.mjs";
import BtsContext from "./bts-context.mjs";
import Console from "./console.mjs";

export default class BtsProject {
  constructor(rootDir, { quizId, lang }) {
    this.ctx = new BtsContext();
    this.lang = lang;
    this.rootDir = rootDir;
    this.quizId = quizId;
    this.url = this.ctx.getQuizUrl(quizId);
    this.quizDir = this.ctx.getQuizDir(quizId);
    this.tsFilename = this.ctx.getTypescriptFile(quizId);
    this.jsFileName = this.ctx.getJavascriptFile(quizId);
    /** @type Sample[] */
    this.samples = [];
  }
  get workingDir() {
    return this.ctx.getWorkingDir();
  }
  get projectDir() {
    return path.resolve(this.rootDir, this.quizDir);
  }
  get typescriptFile() {
    return path.resolve(this.rootDir, this.quizDir, this.tsFilename);
  }
  get javascriptFile() {
    return path.resolve(this.rootDir, this.quizDir, this.jsFileName);
  }
  getProjectDir(relative) {
    const baseDir = relative ? this.workingDir : "";
    return path.relative(baseDir, this.projectDir);
  }
  getTypesScriptFile(relative) {
    const baseDir = relative ? this.workingDir : "";
    return path.relative(baseDir, this.typescriptFile);
  }
  getJavaScriptFile(relative) {
    const baseDir = relative ? this.workingDir : "";
    return path.relative(baseDir, this.javascriptFile);
  }
  getGeneratedScriptFile(relative) {
    return this.lang === "js"
      ? this.getJavaScriptFile(relative)
      : this.getTypesScriptFile(relative);
  }
  validate() {
    const { isExisting } = util.file;
    if (!isExisting(this.projectDir)) {
      Console.printError(`Quiz [${this.quizDir}] does not exists.`);
      return false;
    }
    if (!isExisting(this.getGeneratedScriptFile(false))) {
      Console.printError(
        `Code not found: ${this.getGeneratedScriptFile(true)}`
      );
      return false;
    }
    return true;
  }
  install() {
    try {
      util.dir.create(this.rootDir, this.quizDir);
      this.ctx.job("DELETE_DIR", () => {
        util.dir.delete(this.projectDir);
      });
      const targetFile = this.lang === "ts" ? this.tsFilename : this.jsFileName;
      const sourceFilePath = util.file.create(targetFile, this.projectDir);
      this.ctx.job("DELETE_FILE", () => {
        util.file.delete(sourceFilePath);
      });

      injectCode(this.lang, sourceFilePath);

      fetchSamples(this).then((samples) => {
        this.samples = samples;
        Console.project(this);
      });
    } catch (e) {
      console.log(e);
      this.ctx.rollback();
    }
  }
  compile() {
    if (this.lang === "js") {
      Console.printWarn(
        'Command [bjs] does not support compile. Run your code with "npx bjs --test <quizId>"'
      );
      return;
    }
    const tsCode = util.file.read(this.typescriptFile);
    /** @type {ts.TranspileOptions} */
    const option = {
      moduleName: "sss",
      compilerOptions: {
        module: ts.ModuleKind.NodeNext,
        sourceMap: false,
        sourceRoot: this.projectDir,
        outFile: this.jsFileName,
      },
    };
    const output = ts.transpileModule(tsCode, option);
    util.file.delete(this.javascriptFile);
    util.file.create(this.jsFileName, this.projectDir, output.outputText);
    /*
    if (output.sourceMapText) {
      util.file.delete(`${this.javascriptFile}.map`);
      util.file.create(
        `${this.jsFileName}.map`,
        this.projectDir,
        output.sourceMapText
      );
    }
    */
  }
  loadSamples(tcs) {
    const pattern = tcs || "*.tc";
    const prjDir = `${this.projectDir}/${pattern}`;
    return glob(prjDir).then((tcFiles) => {
      tcFiles.sort((a, b) => a.localeCompare(b));
      this.samples = tcFiles.map((tcPath, idx) => {
        const tcFileName = path.relative(this.projectDir, tcPath);
        const sample = new Sample(this, idx + 1, tcFileName);
        sample.read();
        return sample;
      });
      return this;
    });
  }
  run() {
    this.samples.forEach((sample) => {
      sample.run();
    });
  }
}
