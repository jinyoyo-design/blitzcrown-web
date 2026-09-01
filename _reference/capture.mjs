// Chrome DevTools Protocol capture rig.
//
//   node _reference/capture.mjs <url> <outPrefix> [--w 1440] [--h 900]
//                               [--settle 9000] [--steps 0,0.15,0.3,...]
//
// Chrome's --screenshot flag fires as soon as the virtual time budget expires,
// which lands mid-preloader on the reference site and cannot scroll. Driving
// CDP directly lets us wait in real time for the entrance animation, scroll to
// arbitrary positions, and let each section settle before capturing.
import { spawn } from "node:child_process";
import { mkdir, writeFile, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import os from "node:os";

const CHROME = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
].find((p) => existsSync(p));
if (!CHROME) throw new Error("No Chromium browser found");

const argv = process.argv.slice(2);
const url = argv[0];
const prefix = argv[1];
if (!url || !prefix) throw new Error("usage: capture.mjs <url> <outPrefix> [--w] [--h] [--settle] [--steps]");

const flag = (name, fallback) => {
  const i = argv.indexOf(`--${name}`);
  return i === -1 ? fallback : argv[i + 1];
};

const WIDTH = Number(flag("w", 1440));
const HEIGHT = Number(flag("h", 900));
const SETTLE = Number(flag("settle", 9000));
const STEPS = String(flag("steps", "0"))
  .split(",")
  .map((s) => Number(s.trim()))
  .filter((n) => !Number.isNaN(n));

const OUT = path.join(import.meta.dirname, "shots");
await mkdir(OUT, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Nothing here should be able to wait forever; a stuck capture is worse than
 *  a failed one because it holds a headless Chrome open indefinitely. */
function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    sleep(ms).then(() => {
      throw new Error(`timed out after ${ms}ms waiting for ${label}`);
    }),
  ]);
}
const profile = path.join(os.tmpdir(), `cdp-${Date.now()}`);
const PORT = 9222 + Math.floor(Math.random() * 400);

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--no-sandbox",
    "--disable-gpu-sandbox",
    "--use-gl=angle",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
    "--hide-scrollbars",
    "--mute-audio",
    "--force-device-scale-factor=1",
    "--ignore-certificate-errors",
    `--user-data-dir=${profile}`,
    `--remote-debugging-port=${PORT}`,
    `--window-size=${WIDTH},${HEIGHT}`,
    "about:blank",
  ],
  { stdio: "ignore" }
);

async function debuggerUrl() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      const json = await res.json();
      if (json.webSocketDebuggerUrl) return json.webSocketDebuggerUrl;
    } catch {}
    await sleep(150);
  }
  throw new Error("Chrome debugger never came up");
}

const ws = new WebSocket(await debuggerUrl());
await withTimeout(
  new Promise((res, rej) => {
    ws.addEventListener("open", res, { once: true });
    ws.addEventListener("error", rej, { once: true });
  }),
  15000,
  "debugger websocket"
);

// Guarantee the browser is torn down even when something above throws.
async function shutdown() {
  try {
    ws.close();
  } catch {}
  chrome.kill();
  await sleep(400);
  await rm(profile, { recursive: true, force: true }).catch(() => {});
}

process.on("uncaughtException", async (err) => {
  console.error(`capture failed: ${err.message}`);
  await shutdown();
  process.exit(1);
});

let msgId = 0;
const pending = new Map();
ws.addEventListener("message", (ev) => {
  const msg = JSON.parse(ev.data);
  if (msg.id && pending.has(msg.id)) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(JSON.stringify(msg.error))) : resolve(msg.result);
  }
});

function send(method, params = {}, sessionId) {
  const id = ++msgId;
  const reply = new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });

  // Under software rendering a heavy page can leave the renderer unresponsive,
  // and a CDP command that never answers would otherwise hang the run forever.
  return withTimeout(reply, 60000, `CDP ${method}`);
}

// Attach to a fresh tab so we get a page-scoped session.
const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const page = (method, params) => send(method, params, sessionId);

await page("Page.enable");
await page("Runtime.enable");
await page("Emulation.setDeviceMetricsOverride", {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: 1,
  mobile: false,
});

const loaded = new Promise((resolve) => {
  const onMsg = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.method === "Page.loadEventFired") {
      ws.removeEventListener("message", onMsg);
      resolve();
    }
  };
  ws.addEventListener("message", onMsg);
});

await page("Page.navigate", { url });
await withTimeout(loaded, 30000, "Page.loadEventFired");

// Real-time wait: the entrance timeline and shader warm-up need wall-clock.
await sleep(SETTLE);

const evaluate = (expression) =>
  page("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });

const pageHeight = (
  await evaluate("Math.max(document.body.scrollHeight, document.documentElement.scrollHeight)")
).result.value;

const saved = [];
for (const step of STEPS) {
  const target = Math.round((pageHeight - HEIGHT) * step);

  // Lenis hijacks scrolling, so ask it directly when present.
  await evaluate(`(() => {
    const y = ${target};
    const lenis = window.__lenis || window.lenis;
    if (lenis && typeof lenis.scrollTo === "function") lenis.scrollTo(y, { immediate: true, force: true });
    else window.scrollTo(0, y);
    return true;
  })()`);

  // Let scroll-triggered timelines catch up before capturing.
  await sleep(2200);

  const { data } = await page("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  const file = path.join(OUT, `${prefix}-${WIDTH}-${String(Math.round(step * 100)).padStart(3, "0")}.png`);
  await writeFile(file, Buffer.from(data, "base64"));
  saved.push({ file, step, target });
}

console.log(`pageHeight=${pageHeight}`);
saved.forEach((s) => console.log(`  step ${s.step} (y=${s.target})  ${path.basename(s.file)}`));

await shutdown();
