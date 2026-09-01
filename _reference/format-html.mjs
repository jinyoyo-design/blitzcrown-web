// Re-indents the mirrored SSR HTML. The markup ships as one enormous line,
// which makes it unusable as a rebuild reference; indenting it exposes the
// section structure and the Tailwind classes on every node.
import { readFile, writeFile, mkdir, readdir } from "node:fs/promises";
import path from "node:path";

const SITE = path.join(import.meta.dirname, "site");
const OUT = path.join(import.meta.dirname, "extracted/html");
await mkdir(OUT, { recursive: true });

const VOID = new Set([
  "area", "base", "br", "col", "embed", "hr", "img", "input",
  "link", "meta", "param", "source", "track", "wbr",
]);
const RAW = new Set(["script", "style"]);

function format(html) {
  const tokens = [];
  let i = 0;
  while (i < html.length) {
    const lt = html.indexOf("<", i);
    if (lt === -1) {
      tokens.push({ type: "text", value: html.slice(i) });
      break;
    }
    if (lt > i) tokens.push({ type: "text", value: html.slice(i, lt) });

    // Keep comments and doctype intact.
    if (html.startsWith("<!--", lt)) {
      const end = html.indexOf("-->", lt);
      tokens.push({ type: "comment", value: html.slice(lt, end + 3) });
      i = end + 3;
      continue;
    }
    const gt = html.indexOf(">", lt);
    if (gt === -1) {
      tokens.push({ type: "text", value: html.slice(lt) });
      break;
    }
    const tag = html.slice(lt, gt + 1);
    const nameMatch = /^<\/?\s*([a-zA-Z0-9-]+)/.exec(tag);
    const name = nameMatch ? nameMatch[1].toLowerCase() : "";
    i = gt + 1;

    // Script/style bodies must not be re-indented or they may break.
    if (RAW.has(name) && !tag.startsWith("</") && !tag.endsWith("/>")) {
      const close = html.indexOf(`</${name}`, i);
      const body = close === -1 ? "" : html.slice(i, close);
      const closeGt = close === -1 ? -1 : html.indexOf(">", close);
      tokens.push({ type: "raw", name, open: tag, body });
      i = closeGt === -1 ? html.length : closeGt + 1;
      continue;
    }
    tokens.push({
      type: tag.startsWith("</") ? "close" : "open",
      name,
      value: tag,
      selfClosing: tag.endsWith("/>") || VOID.has(name),
    });
  }

  let depth = 0;
  const lines = [];
  const pad = () => "  ".repeat(Math.max(0, depth));

  for (const t of tokens) {
    if (t.type === "text") {
      const text = t.value.replace(/\s+/g, " ").trim();
      if (text) lines.push(pad() + text);
    } else if (t.type === "comment") {
      lines.push(pad() + t.value);
    } else if (t.type === "raw") {
      const size = t.body.length;
      lines.push(`${pad()}${t.open}  /* ${size} chars elided */</${t.name}>`);
    } else if (t.type === "open") {
      lines.push(pad() + t.value);
      if (!t.selfClosing) depth++;
    } else {
      depth--;
      lines.push(pad() + t.value);
    }
  }
  return lines.join("\n");
}

for (const file of await readdir(SITE)) {
  if (!file.endsWith(".html")) continue;
  const html = await readFile(path.join(SITE, file), "utf8");
  const pretty = format(html);
  await writeFile(path.join(OUT, file), pretty);
  console.log(`${file.padEnd(14)} ${html.length} -> ${pretty.split("\n").length} lines`);
}
