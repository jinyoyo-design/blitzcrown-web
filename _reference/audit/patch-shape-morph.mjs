import { readFileSync, writeFileSync } from "fs";

const p = new URL("../../src/components/gl/shape-particles.tsx", import.meta.url);
let s = readFileSync(p, "utf8");

s = s.replace(
  'const MORPH_SHAPE: ShapeName = "star";',
  'const MORPH_TARGETS = ["star", "diamond", "orb"] as const;\ntype MorphTarget = (typeof MORPH_TARGETS)[number];'
);

s = s.replace(
  `  baseA: { x: number; y: number; z: number };
  baseB: { x: number; y: number; z: number };`,
  `  baseA: { x: number; y: number; z: number };
  morph: Record<MorphTarget, { x: number; y: number; z: number }>;`
);

s = s.replace(
  `    const meshA = SHAPE_MESHES[shape];
    const meshB = SHAPE_MESHES[MORPH_SHAPE];
    const samplesA = sampleMeshSurface(meshA, SHAPE_PARTICLE_COUNT);
    const samplesB = sampleMeshSurface(meshB, SHAPE_PARTICLE_COUNT);
    const scratch = { x: 0, y: 0, z: 0 };`,
  `    const meshA = SHAPE_MESHES[shape];
    const samplesA = sampleMeshSurface(meshA, SHAPE_PARTICLE_COUNT);
    const morphSamples = Object.fromEntries(
      MORPH_TARGETS.map((name) => [name, sampleMeshSurface(SHAPE_MESHES[name], SHAPE_PARTICLE_COUNT)])
    ) as Record<MorphTarget, ReturnType<typeof sampleMeshSurface>>;
    const scratch = { x: 0, y: 0, z: 0 };`
);

s = s.replace(
  `      evaluateSample(meshB.positions, samplesB[i], scratch);
      const bx = scratch.x * SHAPE_PARTICLE_SCALE;
      const by = scratch.y * SHAPE_PARTICLE_SCALE;
      const bz = scratch.z * SHAPE_PARTICLE_SCALE;

      const spawnX = (Math.random() - 0.5) * spawnSpread * 2;`,
  `      const morph: Particle["morph"] = {
        star: { x: 0, y: 0, z: 0 },
        diamond: { x: 0, y: 0, z: 0 },
        orb: { x: 0, y: 0, z: 0 },
      };
      for (const name of MORPH_TARGETS) {
        evaluateSample(SHAPE_MESHES[name].positions, morphSamples[name][i], scratch);
        morph[name] = {
          x: scratch.x * SHAPE_PARTICLE_SCALE,
          y: scratch.y * SHAPE_PARTICLE_SCALE,
          z: scratch.z * SHAPE_PARTICLE_SCALE,
        };
      }

      const spawnX = (Math.random() - 0.5) * spawnSpread * 2;`
);

s = s.replace(
  `        baseA: { x: ax, y: ay, z: az },
        baseB: { x: bx, y: by, z: bz },`,
  `        baseA: { x: ax, y: ay, z: az },
        morph,`
);

s = s.replace(
  `    const morph =
      shapeTarget === MORPH_SHAPE || shapeTarget === "orb" ? shapeMorph : 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localForm = smoothstep(p.formDelay, p.formDelay + (1 - SHAPE_FORMATION_STAGGER), form);

      const mx = p.baseA.x + (p.baseB.x - p.baseA.x) * morph;
      const my = p.baseA.y + (p.baseB.y - p.baseA.y) * morph;
      const mz = p.baseA.z + (p.baseB.z - p.baseA.z) * morph;`,
  `    const morphKey: MorphTarget | null =
      shapeTarget === "diamond" || shapeTarget === "star" || shapeTarget === "orb"
        ? shapeTarget
        : null;
    const morph = morphKey ? shapeMorph : 0;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const localForm = smoothstep(p.formDelay, p.formDelay + (1 - SHAPE_FORMATION_STAGGER), form);

      const tb = morphKey ? p.morph[morphKey] : p.baseA;
      const mx = p.baseA.x + (tb.x - p.baseA.x) * morph;
      const my = p.baseA.y + (tb.y - p.baseA.y) * morph;
      const mz = p.baseA.z + (tb.z - p.baseA.z) * morph;`
);

writeFileSync(p, s);
console.log("ok", s.includes("MORPH_TARGETS"), s.includes("baseB"), s.includes("morphKey"));
