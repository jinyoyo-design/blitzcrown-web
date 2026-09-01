"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { STARFIELD } from "@/config/starfield";
import { resolveGraphics } from "@/config/graphics";
import {
  ambientParticlesFragmentShader,
  ambientParticlesVertexShader,
} from "./shaders/ambient-particles";

type Star = {
  x: number;
  y: number;
  z: number;
  speed: number;
  baseSize: number;
  sparkle: boolean;
};

const DEG2RAD = Math.PI / 180;

/** Half-extents of the view frustum at a given (negative) depth. */
function frustumHalfAt(z: number, aspect: number) {
  const halfH = Math.tan((STARFIELD.fov * DEG2RAD) / 2) * Math.abs(z);
  return { halfW: halfH * aspect, halfH };
}

/** Log-uniform so slow particles dominate and a few streak past quickly. */
function sampleSpeed() {
  const { speedMin, speedMax } = STARFIELD;
  return speedMin * Math.pow(speedMax / speedMin, Math.random());
}

function spawn(sparkle: boolean, aspect: number, recycled: boolean): Star {
  const { spawnFarMin, spawnFarMax, sizeMin, sizeMax, xySpread } = STARFIELD;
  const range = spawnFarMax - spawnFarMin;

  // Recycled particles reappear in the far band only; the initial field is
  // spread across the whole depth range so it looks settled on first paint.
  const z = recycled
    ? -(spawnFarMax - Math.random() * range * 0.4)
    : -(spawnFarMin + Math.random() * range);

  const { halfW, halfH } = frustumHalfAt(z, aspect);

  return {
    x: (Math.random() - 0.5) * halfW * 2 * xySpread,
    y: (Math.random() - 0.5) * halfH * 2 * xySpread,
    z,
    speed: sampleSpeed(),
    baseSize: sizeMin + Math.random() * (sizeMax - sizeMin),
    sparkle,
  };
}

/** Exactly `sparkleRatio` of the field is bright, shuffled through the array. */
function sparkleFlags(count: number) {
  const brightCount = Math.floor(STARFIELD.sparkleRatio * count);
  const flags = Array.from({ length: count }, (_, i) => i < brightCount);
  for (let i = flags.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [flags[i], flags[j]] = [flags[j], flags[i]];
  }
  return flags;
}

function recycleStar(star: Star, aspect: number) {
  const next = spawn(star.sparkle, aspect, true);
  star.x = next.x;
  star.y = next.y;
  star.z = next.z;
  star.speed = next.speed;
  star.baseSize = next.baseSize;
}

export function AmbientParticles() {
  const size = useThree((state) => state.size);
  const aspect = size.width > 0 ? size.width / Math.max(size.height, 1) : 0;
  const aspectRef = useRef(aspect);
  aspectRef.current = aspect;

  // Spawn positions depend on the frustum width, so the field is rebuilt on
  // resize rather than stretched. Rounding keeps drag-resizing from thrashing.
  const aspectKey = Math.round(aspect * 20) / 20;

  const field = useMemo(() => {
    if (aspectKey <= 0) return null;

    const { count: maxCount, brightSizeMul, brightLevel, dimLevel } = STARFIELD;
    const count = Math.min(resolveGraphics().starCount, maxCount);
    const stars = sparkleFlags(count).map((sparkle) => spawn(sparkle, aspectKey, false));

    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);
    const tints = new Float32Array(count * 3);

    const palette = STARFIELD.colors.map((hex) => new THREE.Color(hex));

    stars.forEach((star, i) => {
      positions[i * 3] = star.x;
      positions[i * 3 + 1] = star.y;
      positions[i * 3 + 2] = star.z;

      sizes[i] = star.baseSize * (star.sparkle ? brightSizeMul : 1);
      brightness[i] = star.sparkle ? brightLevel : dimLevel;

      const tint = palette[Math.floor(Math.random() * palette.length)];
      tints[i * 3] = tint.r;
      tints[i * 3 + 1] = tint.g;
      tints[i * 3 + 2] = tint.b;
    });

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("brightness", new THREE.BufferAttribute(brightness, 1));
    geometry.setAttribute("tint", new THREE.BufferAttribute(tints, 3));

    const uniforms = {
      uReferenceDepth: { value: STARFIELD.referenceDepth },
      uFadeDepth: { value: STARFIELD.spawnFarMax },
      uNearFadeDepth: { value: STARFIELD.nearFadeDepth },
    };

    return { stars, geometry, uniforms };
  }, [aspectKey]);

  useFrame((_, rawDelta) => {
    if (!field) return;

    // Clamp so a backgrounded tab doesn't teleport the whole field forward.
    const delta = Math.min(rawDelta, 0.05);
    const positions = field.geometry.getAttribute("position") as THREE.BufferAttribute;
    const array = positions.array as Float32Array;

    for (let i = 0; i < field.stars.length; i++) {
      const star = field.stars[i];
      star.z += star.speed * delta;

      if (star.z > STARFIELD.recycleZ) {
        recycleStar(star, aspectRef.current);
        array[i * 3] = star.x;
        array[i * 3 + 1] = star.y;
      }

      array[i * 3 + 2] = star.z;
    }

    positions.needsUpdate = true;
  });

  if (!field) return null;

  return (
    <points frustumCulled={false} renderOrder={1} geometry={field.geometry}>
      <shaderMaterial
        vertexShader={ambientParticlesVertexShader}
        fragmentShader={ambientParticlesFragmentShader}
        uniforms={field.uniforms}
        transparent
        depthTest
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
