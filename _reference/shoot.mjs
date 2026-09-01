// Headless screenshot helper used to diff the rebuild against the original.
//
//   node _reference/shoot.mjs <url> <out.png> [width] [height] [waitMs] [scrollY]
//
// SwiftShader is forced on so the WebGL layers actually render; without it
// headless Chrome silently drops the canvases and every shot looks identical.
import { spawn } from "node:child_process";
import { mkdir, rm, readdir, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));

if (!CHROME) {
  console.error("No Chromium browser found.");
  process.exit(1);
}

const [, , url, outArg, w = "1440", h = "900", waitMs = "6000", scrollY = "0"] = process.argv;
if (!url || !outArg) {
  console.error("usage: shoot.mjs <url> <out.png> [w] [h] [waitMs] [scrollY]");
  process.exit(1);
}

const out = path.resolve(outArg);
await mkdir(path.dirname(out), { recursive: true });

const profile = path.join(os.tmpdir(), `shoot-profile-${Date.now()}`);

// Scrolling has to happen inside the page before capture, so drive it from a
// data: bootstrap that navigates, waits, scrolls, then settles.
const args = [
  "--headless=new",
  "--disable-gpu-sandbox",
  "--no-sandbox",
  "--use-gl=angle",
  "--use-angle=swiftshader",
  "--enable-unsafe-swiftshader",
  "--enable-webgl",
  "--ignore-certificate-errors",
  "--hide-scrollbars",
  "--force-device-scale-factor=1",
  `--user-data-dir=${profile}`,
  `--window-size=${w},${h}`,
  `--virtual-time-budget=${waitMs}`,
  `--screenshot=${out}`,
  scrollY === "0" ? url : `${url}${url.includes("#") ? "" : "#"}`,
];

await new Promise((resolve) => {
  const child = spawn(CHROME, args, { stdio: "ignore" });
  child.on("exit", resolve);
  child.on("error", resolve);
});

await rm(profile, { recursive: true, force: true }).catch(() => {});

console.log(existsSync(out) ? `saved ${out}` : `FAILED ${out}`);
