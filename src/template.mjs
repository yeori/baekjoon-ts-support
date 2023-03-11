import util from "./util.mjs";

const DEFAULT_TYPESCRIPT_CODE = "template/template.ts";
const DEFAULT_JAVACRIPT_CODE = "template/template.js";
const TEMPLATES = {
  ts: DEFAULT_TYPESCRIPT_CODE,
  js: DEFAULT_JAVACRIPT_CODE,
};

export function injectCode(lang, filePath) {
  const { file } = util;
  const templateFile = TEMPLATES[lang];
  if (file.isExisting(templateFile)) {
    const templateCode = file.read(templateFile);
    file.write(filePath, templateCode);
  } else {
    console.log("[no template]");
  }
}
