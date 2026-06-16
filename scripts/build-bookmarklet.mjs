import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const scriptUrl = process.argv[2] || "https://example.com/deepcut-enhancer.js";
const root = process.cwd();
const templatePath = path.join(root, "bookmarklet", "loader.template.js");
const sourcePath = path.join(root, "src", "deepcut-enhancer.js");
const dist = path.join(root, "dist");

const [template, source] = await Promise.all([
  readFile(templatePath, "utf8"),
  readFile(sourcePath, "utf8")
]);

await mkdir(dist, { recursive: true });
await writeFile(path.join(dist, "deepcut-enhancer.js"), source, "utf8");
await writeFile(path.join(dist, "bookmarklet.txt"), template.replace("__SCRIPT_URL__", scriptUrl), "utf8");
await writeFile(path.join(dist, "bookmarklet-inline.txt"), `javascript:${encodeURIComponent(source)}`, "utf8");

console.log(`Wrote ${path.join("dist", "deepcut-enhancer.js")}`);
console.log(`Wrote ${path.join("dist", "bookmarklet.txt")}`);
console.log(`Wrote ${path.join("dist", "bookmarklet-inline.txt")}`);
