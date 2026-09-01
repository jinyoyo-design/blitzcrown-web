/**
 * Quantify how the hero particle silhouette moves across center-crop frames.
 * Reads PNGs via the `pngjs` pattern isn't available — use ffmpeg rawrgb instead.
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const DIR = path.join(import.meta.dirname, "shots/hero-motion");
const frames = Array.from({ length: 42 }, (_, i) =>
  path.join(DIR, `c-${String(i + 1).padStart(3, "0")}.png`)
);

const W = 400;
const H = 400;

function loadRaw(pngPath) {
  const tmp = mkdtempSync(path.join(tmpdir(), "raw-"));
  const out = path.join(tmp, "f.rgb");
  execFileSync("ffmpeg", ["-v", "error", "-i", pngPath, "-f", "rawvideo", "-pix_fmt", "rgb24", out], {
    stdio: "ignore",
  });
  const buf = readFileSync(out);
  rmSync(tmp, { recursive: true, force: true });
  return buf;
}

function analyze(buf) {
  let sum = 0;
  let sumX = 0;
  let sumY = 0;
  let sumXX = 0;
  let sumYY = 0;
  let sumXY = 0;
  let brightCount = 0;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      const lum = (buf[i] + buf[i + 1] + buf[i + 2]) / 3;
      if (lum < 28) continue;
      const w = lum;
      sum += w;
      sumX += x * w;
      sumY += y * w;
      sumXX += x * x * w;
      sumYY += y * y * w;
      sumXY += x * y * w;
      brightCount++;
    }
  }

  if (sum < 1) return null;
  const cx = sumX / sum;
  const cy = sumY / sum;
  // Covariance for principal axis (rotation proxy)
  const covXX = sumXX / sum - cx * cx;
  const covYY = sumYY / sum - cy * cy;
  const covXY = sumXY / sum - cx * cy;
  const angle = 0.5 * Math.atan2(2 * covXY, covXX - covYY);
  const meanLum = sum / (W * H);

  return {
    cx,
    cy,
    angleDeg: (angle * 180) / Math.PI,
    brightCount,
    meanLum,
  };
}

const rows = [];
for (let i = 0; i < frames.length; i++) {
  const buf = loadRaw(frames[i]);
  const a = analyze(buf);
  rows.push({ i: i + 1, t: i / 5, ...a });
}

const first = rows[0];
console.log("frame  t(s)   cx     cy    angle°  bright  meanLum  Δangle  Δcx   Δcy");
for (const r of rows) {
  if (!r.cx) {
    console.log(`${String(r.i).padStart(5)}  missing`);
    continue;
  }
  const dA = (r.angleDeg - first.angleDeg).toFixed(2);
  const dX = (r.cx - first.cx).toFixed(1);
  const dY = (r.cy - first.cy).toFixed(1);
  console.log(
    `${String(r.i).padStart(5)}  ${r.t.toFixed(1).padStart(4)}  ${r.cx.toFixed(1).padStart(6)} ${r.cy
      .toFixed(1)
      .padStart(6)}  ${r.angleDeg.toFixed(2).padStart(7)}  ${String(r.brightCount).padStart(6)}  ${r.meanLum
      .toFixed(2)
      .padStart(7)}  ${dA.padStart(7)} ${dX.padStart(5)} ${dY.padStart(5)}`
  );
}

// Summarise motion character
const angles = rows.map((r) => r.angleDeg);
const cxs = rows.map((r) => r.cx);
const cys = rows.map((r) => r.cy);
const brights = rows.map((r) => r.brightCount);
const range = (arr) => Math.max(...arr) - Math.min(...arr);
console.log("\n--- summary over 8.4s ---");
console.log(`angle range: ${range(angles).toFixed(2)}°`);
console.log(`centroid X range: ${range(cxs).toFixed(1)} px`);
console.log(`centroid Y range: ${range(cys).toFixed(1)} px`);
console.log(
  `bright-pixel range: ${Math.min(...brights)} .. ${Math.max(...brights)} (Δ ${range(brights)})`
);

// Angular velocity estimate (unwrap-ish via adjacent diffs)
let totalAbsTurn = 0;
for (let i = 1; i < angles.length; i++) {
  let d = angles[i] - angles[i - 1];
  if (d > 90) d -= 180;
  if (d < -90) d += 180;
  totalAbsTurn += Math.abs(d);
}
console.log(`cumulative |Δangle| (adjacent): ${totalAbsTurn.toFixed(2)}° over 8.4s`);
console.log(`approx mean |spin| rate: ${(totalAbsTurn / 8.4).toFixed(2)} °/s`);

writeFileSync(
  path.join(DIR, "motion-metrics.json"),
  JSON.stringify({ rows, summary: { angleRange: range(angles), totalAbsTurn } }, null, 2)
);
