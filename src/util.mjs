import path from "path";
import fs from "fs";
import https from "https";

const dir = {
  assertNull: (path) => {
    if (fs.existsSync(path)) {
      throw new Error(`Directory [${path}] exists`);
    }
  },
  assertExist: (path) => {
    if (!fs.existsSync(path)) {
      throw new Error(`Directory [${path}] does not exists`);
    }
  },
  isExisting: (path) => fs.existsSync(path),
  isNull: (path) => !fs.existsSync(path),
  create: (parentDir, subDir) => {
    dir.assertExist(parentDir);
    const dirPath = path.resolve(parentDir, subDir);
    dir.assertNull(dirPath);
    return fs.mkdirSync(dirPath, { recursive: true });
  },
};

const file = {
  assertNull: null,
  assertExist: null,
  isExisting: null,
  isNull: null,
  create: (
    /** @type string */ filename,
    /** @type string */ parentDir,
    /**@type string */ content
  ) => {
    dir.assertExist(parentDir);
    const filePath = path.resolve(parentDir, filename);
    fs.openSync(filePath, "wx");
    if (content) {
      fs.writeFileSync(filePath, content, { encoding: "utf-8" });
    }
    return filePath;
  },
  read: (filepath) => {
    return fs.readFileSync(filepath, { encoding: "utf-8" }).toString("utf-8");
  },
  write: (filepath, content) => {
    fs.writeFileSync(filepath, content, { encoding: "utf-8" });
  },
  delete: (filepath) => {
    if (file.isExisting(filepath)) {
      fs.unlinkSync(filepath);
    }
  },
};

file.assertExist = dir.assertExist;
file.isExisting = dir.isExisting;
file.isNull = dir.isNull;

const remote = {
  get: (url) => {
    const body = [];
    return new Promise((ok, failed) => {
      https.get(url, (res) => {
        res.on("data", (frags) => {
          body.push(frags);
        });
        res.on("end", () => {
          ok(body.join(""));
        });
        res.on("error", (err) => {
          failed({ error: err });
        });
      });
    });
  },
};
export default {
  dir,
  file,
  remote,
};
