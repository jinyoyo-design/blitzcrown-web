/**
 * Cage meshes for the hero particle field.
 *
 * Particles are scattered across the surface of these meshes, so the meshes
 * themselves are never drawn and can stay very low-poly ??only the silhouette
 * matters. Each shape is sampled independently into the same particle count,
 * so morphing between them is a straight lerp of position arrays and does not
 * require shared topology.
 */

import * as THREE from "three";

export type ShapeMesh = {
  positions: Float32Array;
  indices: Uint16Array;
};

/** Points around the ring. Kept so star / orb stay morph-compatible with each other. */
const RING_POINTS = 8;

type BipyramidOptions = {
  outerRadius: number;
  innerRadius: number;
  depth: number;
  offsetAngle?: number;
};

function bipyramid({
  outerRadius,
  innerRadius,
  depth,
  offsetAngle = 0,
}: BipyramidOptions): ShapeMesh {
  const ringCount = RING_POINTS * 2;
  const positions = new Float32Array((ringCount + 2) * 3);

  for (let i = 0; i < ringCount; i++) {
    const angle = offsetAngle + (i / ringCount) * Math.PI * 2;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = Math.sin(angle) * radius;
    positions[i * 3 + 2] = 0;
  }

  const topIndex = ringCount;
  const bottomIndex = ringCount + 1;
  positions[topIndex * 3 + 2] = depth;
  positions[bottomIndex * 3 + 2] = -depth;

  const indices = new Uint16Array(ringCount * 2 * 3);
  let cursor = 0;
  for (let i = 0; i < ringCount; i++) {
    const next = (i + 1) % ringCount;
    indices[cursor++] = i;
    indices[cursor++] = next;
    indices[cursor++] = topIndex;
    indices[cursor++] = next;
    indices[cursor++] = i;
    indices[cursor++] = bottomIndex;
  }

  return { positions, indices };
}

/**
 * Centre and scale a geometry so its longest axis sits in [-0.5, 0.5].
 * Particles sit on the surface; absolute size is applied later as a uniform.
 */
function normalizeGeometry(geometry: THREE.BufferGeometry): ShapeMesh {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox!;
  const size = new THREE.Vector3();
  box.getSize(size);
  const scale = 1 / Math.max(size.x, size.y, size.z, 1e-6);
  geometry.center();
  geometry.scale(scale, scale, scale);

  const pos = geometry.getAttribute("position");
  const positions = new Float32Array(pos.array.length);
  positions.set(pos.array as ArrayLike<number>);

  const index = geometry.getIndex();
  let indices: Uint16Array;
  if (index) {
    indices = new Uint16Array(index.array.length);
    indices.set(index.array as ArrayLike<number>);
  } else {
    // ExtrudeGeometry sometimes ships non-indexed; invent a sequential index
    // so surface sampling still has triangles to walk.
    const triCount = pos.count;
    indices = new Uint16Array(triCount);
    for (let i = 0; i < triCount; i++) indices[i] = i;
  }

  geometry.dispose();
  return { positions, indices };
}

/**
 * Blitzcrown mark from `img/logo/LOGO.svg`.
 *
 * The path is a single closed silhouette of three lightning peaks. Extruding
 * it a little in Z gives the particle field a thin volume so the form reads
 * as a solid mark rather than a flat stamp when the camera drifts.
 *
 * SVG Y grows downward; Three.js Y grows upward, so the shape is flipped
 * before extrusion.
 */
function buildLightningMesh(): ShapeMesh {
  // Path `d` from LOGO.svg, Y already flipped (524 - y).
  const shape = new THREE.Shape();
  shape.moveTo(0, 0.426);
  shape.lineTo(488.502, 226.334);
  shape.bezierCurveTo(499.064, 159.891, 512.266, 66.87, 520.187, 0.426);
  shape.lineTo(1008.69, 226.334);
  shape.lineTo(1040.37, 0.426);
  shape.bezierCurveTo(1138.07, 45.608, 1431.18, 181.153, 1528.88, 226.334);
  shape.lineTo(1560.57, 0.426);
  shape.lineTo(1655.62, 524);
  shape.lineTo(1167.12, 298.092);
  shape.lineTo(1135.44, 524);
  shape.bezierCurveTo(1021.89, 470.8452, 760.479, 351.247, 646.935, 298.092);
  shape.lineTo(615.246, 524);
  shape.lineTo(0, 0.426);
  shape.closePath();

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 90,
    bevelEnabled: false,
    curveSegments: 8,
  });

  return normalizeGeometry(geometry);
}

/** Four-pointed sparkle kept as a morph target for later scroll sections. */
export const STAR_MESH = bipyramid({
  outerRadius: 1,
  innerRadius: 0.26,
  depth: 0.16,
});

/** Soft resting blob used between transitions. */
export const ORB_MESH = bipyramid({
  outerRadius: 1,
  innerRadius: 0.96,
  depth: 0.7,
});

/** Octahedral diamond ??featured-work morph target in the reference site. */
function buildDiamondMesh(): ShapeMesh {
  const positions = new Float32Array(6 * 3);
  // Equator square
  const r = 1;
  const eq = [
    [r, 0, 0],
    [0, r, 0],
    [-r, 0, 0],
    [0, -r, 0],
  ] as const;
  for (let i = 0; i < 4; i++) {
    positions[i * 3] = eq[i][0];
    positions[i * 3 + 1] = eq[i][1];
    positions[i * 3 + 2] = eq[i][2];
  }
  // Poles
  positions[4 * 3 + 2] = 0.7;
  positions[5 * 3 + 2] = -0.7;

  const indices = new Uint16Array(8 * 3);
  let c = 0;
  for (let i = 0; i < 4; i++) {
    const next = (i + 1) % 4;
    indices[c++] = i;
    indices[c++] = next;
    indices[c++] = 4;
    indices[c++] = next;
    indices[c++] = i;
    indices[c++] = 5;
  }
  return { positions, indices };
}

export const DIAMOND_MESH = buildDiamondMesh();

/** Brand mark ??default hero geometry. */
export const LIGHTNING_MESH = buildLightningMesh();

export const SHAPE_MESHES = {
  lightning: LIGHTNING_MESH,
  star: STAR_MESH,
  orb: ORB_MESH,
  diamond: DIAMOND_MESH,
} satisfies Record<string, ShapeMesh>;

export type ShapeName = keyof typeof SHAPE_MESHES;
