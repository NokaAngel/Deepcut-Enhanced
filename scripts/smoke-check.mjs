import { readFile } from "node:fs/promises";

const required = [
  "manifest.json",
  "src/background.js",
  "src/deepcut-enhancer.js",
  "src/icon-128.png",
  "src/popup.html",
  "src/popup.js",
  "bookmarklet/loader.template.js"
];

for (const file of required) {
  const text = await readFile(file, "utf8");
  if (!text.trim()) throw new Error(`${file} is empty`);
}

JSON.parse(await readFile("manifest.json", "utf8"));
await import("./build-bookmarklet.mjs");

console.log("Deepcut Enhancer smoke check passed.");
