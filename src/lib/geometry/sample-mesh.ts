import type { ShapeMesh } from "./particle-shapes";

export type SurfaceSample = {
  i0: number;
  i1: number;
  i2: number;
  /** Barycentric u,v with w = 1 - u - v. */
  u: number;
  v: number;
};

type Triangle = {
  i0: number;
  i1: number;
  i2: number;
  area: number;
};

function triangleArea(
  positions: Float32Array,
  i0: number,
  i1: number,
  i2: number
): number {
  const ax = positions[i0 * 3];
  const ay = positions[i0 * 3 + 1];
  const az = positions[i0 * 3 + 2];
  const bx = positions[i1 * 3] - ax;
  const by = positions[i1 * 3 + 1] - ay;
  const bz = positions[i1 * 3 + 2] - az;
  const cx = positions[i2 * 3] - ax;
  const cy = positions[i2 * 3 + 1] - ay;
  const cz = positions[i2 * 3 + 2] - az;
  // |B × C| / 2
  const nx = by * cz - bz * cy;
  const ny = bz * cx - bx * cz;
  const nz = bx * cy - by * cx;
  return 0.5 * Math.hypot(nx, ny, nz);
}

function buildTriangles(mesh: ShapeMesh): { triangles: Triangle[]; totalArea: number } {
  const { positions, indices } = mesh;
  const triangles: Triangle[] = [];
  let totalArea = 0;

  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i];
    const i1 = indices[i + 1];
    const i2 = indices[i + 2];
    const area = triangleArea(positions, i0, i1, i2);
    if (area < 1e-12) continue;
    triangles.push({ i0, i1, i2, area });
    totalArea += area;
  }

  return { triangles, totalArea };
}

function pickTriangle(triangles: Triangle[], totalArea: number): Triangle {
  let r = Math.random() * totalArea;
  for (const tri of triangles) {
    r -= tri.area;
    if (r <= 0) return tri;
  }
  return triangles[triangles.length - 1];
}

/** Uniform random point inside a triangle, in barycentric form. */
function randomBarycentric(): { u: number; v: number } {
  let u = Math.random();
  let v = Math.random();
  if (u + v > 1) {
    u = 1 - u;
    v = 1 - v;
  }
  return { u, v };
}

/**
 * Scatter `count` samples across the mesh surface, weighted by triangle area
 * so denser regions of the silhouette aren't over-sampled relative to thin tips.
 */
export function sampleMeshSurface(mesh: ShapeMesh, count: number): SurfaceSample[] {
  const { triangles, totalArea } = buildTriangles(mesh);
  if (triangles.length === 0 || totalArea <= 0) {
    throw new Error("sampleMeshSurface: mesh has no usable triangles");
  }

  const samples: SurfaceSample[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const tri = pickTriangle(triangles, totalArea);
    const { u, v } = randomBarycentric();
    samples[i] = { i0: tri.i0, i1: tri.i1, i2: tri.i2, u, v };
  }
  return samples;
}

/** Evaluate a stored surface sample against a mesh's current positions. */
export function evaluateSample(
  positions: Float32Array,
  sample: SurfaceSample,
  out: { x: number; y: number; z: number }
) {
  const { i0, i1, i2, u, v } = sample;
  const w = 1 - u - v;
  out.x = positions[i0 * 3] * w + positions[i1 * 3] * u + positions[i2 * 3] * v;
  out.y =
    positions[i0 * 3 + 1] * w + positions[i1 * 3 + 1] * u + positions[i2 * 3 + 1] * v;
  out.z =
    positions[i0 * 3 + 2] * w + positions[i1 * 3 + 2] * u + positions[i2 * 3 + 2] * v;
}
