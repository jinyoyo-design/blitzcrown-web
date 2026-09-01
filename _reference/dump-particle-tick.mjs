import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

const src = readFileSync(
  path.join(import.meta.dirname, "site/_next/static/chunks/1g7zs99-fkzkz.js"),
  "utf8"
);

// Dump the particle field tick + rotation wiring regions.
const markers = [
  ["tick-fn", "function R(e=1/60,t=null)", 5500],
  ["scroll-rot", "GEOMETRY_SCROLL_ROTATION", 800],
  ["particleScrollState", "particleScrollState", 1200],
  ["setSpawnLayout", "setSpawnLayout", 900],
  ["pointer-local", "localSmoothX", 2500],
  ["entry", "entryAnimation", 1500],
  ["rotation-group", "geometryRotation", 1500],
  ["useFrame-particle", "registerParticleField", 2000],
];

let out = "";
for (const [name, marker, after] of markers) {
  const idx = src.indexOf(marker);
  if (idx === -1) {
    out += `\n\n===== ${name}: NOT FOUND =====\n`;
    continue;
  }
  out += `\n\n===== ${name} @ ${idx} =====\n`;
  out += src.slice(Math.max(0, idx - 200), idx + after);
}

writeFileSync(path.join(import.meta.dirname, "extracted/particle-tick-dump.txt"), out);
console.log("wrote", out.length, "chars");
