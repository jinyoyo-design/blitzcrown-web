// Serves the mirrored original so it can be opened and screenshotted side by
// side with the rebuild. Everything the page needs was mirrored, so it runs
// its real JS/WebGL rather than being a static picture.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const ROOT = path.join(import.meta.dirname, "site");
const PORT = Number(process.env.PORT ?? 4000);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
};

async function resolve(urlPath) {
  const clean = decodeURIComponent(urlPath.split("?")[0]);
  const candidates = [
    clean,
    `${clean}.html`,
    path.posix.join(clean, "index.html"),
    clean === "/" ? "/index.html" : null,
  ].filter(Boolean);

  for (const c of candidates) {
    const abs = path.join(ROOT, c.replace(/^\/+/, ""));
    if (!abs.startsWith(ROOT)) continue;
    try {
      const s = await stat(abs);
      if (s.isFile()) return abs;
    } catch {}
  }
  return null;
}

createServer(async (req, res) => {
  const file = await resolve(req.url ?? "/");
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain" });
    res.end("not mirrored: " + req.url);
    return;
  }
  const body = await readFile(file);
  res.writeHead(200, {
    "content-type": TYPES[path.extname(file).toLowerCase()] ?? "application/octet-stream",
    "cache-control": "no-store",
  });
  res.end(body);
}).listen(PORT, () => console.log(`reference original -> http://localhost:${PORT}`));
