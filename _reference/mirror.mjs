// Mirrors the reference site (HTML + every static asset it transitively references)
// into _reference/site so the original can be studied and diffed offline.
import { mkdir, writeFile, readFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const ORIGIN = "https://www.ricardochance.com";
const OUT = path.join(import.meta.dirname, "site");

const SEED_PAGES = ["/", "/es", "/about", "/work", "/es/about", "/es/work", "/site.webmanifest"];

// Text assets get rescanned for further references; binaries are just saved.
const TEXT_EXT = new Set([".js", ".css", ".json", ".txt", ".map", ".svg", ".glsl"]);

const seen = new Set();
const queue = [];
const failures = [];

function enqueue(url) {
  if (!url || seen.has(url)) return;
  seen.add(url);
  queue.push(url);
}

function toLocalPath(url) {
  const u = new URL(url);
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith("/")) p += "index.html";
  if (!path.extname(p)) p += ".html";
  return path.join(OUT, p.replace(/^\/+/, ""));
}

// Pulls same-origin and root-relative asset references out of HTML/JS/CSS text.
function extractRefs(text, baseUrl) {
  const refs = new Set();
  const patterns = [
    /["'`(](\/_next\/[^"'`)\s\\]+)["'`)]/g,
    /["'`(](\/[A-Za-z0-9_\-./@]+\.(?:woff2?|ttf|otf|png|jpe?g|webp|avif|gif|svg|ico|mp4|webm|mov|glb|gltf|hdr|exr|json|txt|glsl|frag|vert))["'`)]/g,
    /(https?:\/\/www\.ricardochance\.com\/[^"'`)\s\\]+)/g,
    /url\(\s*["']?([^"')]+)["']?\s*\)/g,
  ];
  for (const re of patterns) {
    for (const m of text.matchAll(re)) {
      const raw = m[1];
      if (!raw || raw.startsWith("data:")) continue;
      try {
        const abs = new URL(raw, baseUrl);
        if (abs.origin === ORIGIN) refs.add(abs.href.split("#")[0]);
      } catch {}
    }
  }
  return refs;
}

async function download(url) {
  const res = await fetch(url, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
      accept: "*/*",
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return Buffer.from(await res.arrayBuffer());
}

SEED_PAGES.forEach((p) => enqueue(ORIGIN + p));

let done = 0;
while (queue.length) {
  const batch = queue.splice(0, 8);
  await Promise.all(
    batch.map(async (url) => {
      const dest = toLocalPath(url);
      let buf;
      try {
        buf = await download(url);
      } catch (err) {
        failures.push(`${url} -> ${err.message}`);
        return;
      }
      await mkdir(path.dirname(dest), { recursive: true });
      await writeFile(dest, buf);
      done++;

      const ext = path.extname(dest).toLowerCase();
      if (ext === ".html" || TEXT_EXT.has(ext)) {
        for (const ref of extractRefs(buf.toString("utf8"), url)) enqueue(ref);
      }
      process.stdout.write(`\r[${done}] queued:${queue.length} ${path.basename(dest).slice(0, 40)}      `);
    })
  );
}

console.log(`\n\nDownloaded ${done} files into ${OUT}`);
if (failures.length) {
  console.log(`\n${failures.length} failures:`);
  failures.slice(0, 30).forEach((f) => console.log("  " + f));
}
