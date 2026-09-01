import { writeFileSync } from "node:fs";
import { LIGHTNING_MESH } from "../src/lib/geometry/particle-shapes.ts";
import { evaluateSample, sampleMeshSurface } from "../src/lib/geometry/sample-mesh.ts";

const W = 800;
const H = 260;
const buf = Buffer.alloc(W * H * 3, 8);
const samples = sampleMeshSurface(LIGHTNING_MESH, 8000);
const s = { x: 0, y: 0, z: 0 };

for (const sample of samples) {
  evaluateSample(LIGHTNING_MESH.positions, sample, s);
  const x = Math.floor((s.x + 0.5) * (W - 1));
  const y = Math.floor((0.5 - s.y / 0.32) * (H - 1));
  if (x < 0 || x >= W || y < 0 || y >= H) continue;
  const i = (y * W + x) * 3;
  buf[i] = 180;
  buf[i + 1] = 140;
  buf[i + 2] = 255;
}

writeFileSync(
  "_reference/shots/lightning-samples.ppm",
  Buffer.concat([Buffer.from(`P6\n${W} ${H}\n255\n`), buf])
);
console.log("wrote _reference/shots/lightning-samples.ppm");
