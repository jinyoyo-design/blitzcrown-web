import { readFileSync, writeFileSync, mkdirSync } from "fs";
import path from "path";

const html = readFileSync(
  path.join(import.meta.dirname, "extracted/html/index.html"),
  "utf8"
);

const sectionRe = /<(section|footer)(\s[^>]*)?>/g;
const blocks = [];
let m;
while ((m = sectionRe.exec(html))) {
  const start = m.index;
  const tag = m[1];
  const openEnd = html.indexOf(">", start);
  const open = html.slice(start, openEnd + 1);
  // find matching close roughly by next section/footer or end
  const next = html.slice(openEnd + 1).search(/<\/?(section|footer)[\s>]/i);
  const chunk =
    next === -1
      ? html.slice(start, start + 800)
      : html.slice(start, openEnd + 1 + next);
  const text = chunk
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 220);
  const attrs = {
    geometry: /data-geometry="([^"]+)"/.exec(open)?.[1] ?? null,
    dissolve: /data-dissolve="([^"]+)"/.exec(open)?.[1] ?? null,
    homeHero: /data-home-hero/.test(open),
    className: /class="([^"]*)"/.exec(open)?.[1]?.slice(0, 120) ?? "",
  };
  blocks.push({ tag, attrs, text });
}

mkdirSync(path.join(import.meta.dirname, "audit"), { recursive: true });
writeFileSync(
  path.join(import.meta.dirname, "audit/original-sections.json"),
  JSON.stringify(blocks, null, 2)
);
console.log(JSON.stringify(blocks, null, 2));
