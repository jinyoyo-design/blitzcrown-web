"use client";

import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import * as THREE from "three";
import { blobFragmentShader, blobVertexShader } from "./shaders/blob-background";
import {
  BLOB_DISPLACEMENT,
  BLOB_MORPH_SPEED,
  BLOB_RANDOMNESS,
  BLOOM_SMOOTHING,
  BLOOM_THRESHOLD,
  GRADIENT_COLOR_BLEND,
  GRADIENT_COLOR_WEIGHTS,
  GRADIENT_COLORS,
  SCROLL_GRADIENT_DOWN_SPEED,
  SCROLL_GRADIENT_UP_SPEED,
} from "@/config/visuals";
import { resolveGraphics } from "@/config/graphics";
import { useScrollStore } from "@/stores/scroll-store";

function BlobPlane() {
  const material = useRef<THREE.ShaderMaterial>(null);
  // World units covered by the camera, so the unit plane can be stretched to
  // fill the viewport exactly at any size.
  const viewport = useThree((state) => state.viewport);
  // The shader keeps its own clock so scrolling can speed it up or slow it
  // down without the gradient ever jumping.
  const clock = useRef(0);

  const uniforms = useMemo(
    () => ({
      u_time: { value: 0 },
      u_color1: { value: new THREE.Color(GRADIENT_COLORS.shadow) },
      u_color2: { value: new THREE.Color(GRADIENT_COLORS.glow) },
      u_weight1: { value: GRADIENT_COLOR_WEIGHTS[0] },
      u_weight2: { value: GRADIENT_COLOR_WEIGHTS[1] },
      u_blobRandomness: { value: BLOB_RANDOMNESS },
      u_blobDisplacement: { value: BLOB_DISPLACEMENT },
      u_blobMorphSpeed: { value: BLOB_MORPH_SPEED },
      u_colorBlend: { value: GRADIENT_COLOR_BLEND },
      u_aspect: { value: 1 },
      u_poolCenter: { value: new THREE.Vector2(0.45, 0.5) },
    }),
    []
  );

  useFrame((_, delta) => {
    const velocity = useScrollStore.getState().velocity;
    const speed = velocity > 0 ? SCROLL_GRADIENT_DOWN_SPEED : SCROLL_GRADIENT_UP_SPEED;
    const engagement = Math.min(Math.abs(velocity) / 30, 1);

    clock.current += delta * (1 + (speed - 1) * engagement);

    // Write through the ref, not the memoized object above: R3F copies the
    // `uniforms` prop onto the material rather than adopting it, so mutating
    // our own object leaves the shader reading its initial values forever.
    const live = material.current?.uniforms;
    if (!live) return;

    live.u_time.value = clock.current;
    live.u_aspect.value = viewport.width / Math.max(viewport.height, 0.0001);

    // Layered sines at incommensurate frequencies wander smoothly and never
    // settle into a visible repeat, which is all the drift needs to do.
    const t = clock.current * 0.078;
    live.u_poolCenter.value.set(
      0.45 + 0.3 * Math.sin(t * 0.31) + 0.12 * Math.sin(t * 0.73 + 1.3),
      0.5 + 0.26 * Math.sin(t * 0.27 + 2.1) + 0.1 * Math.sin(t * 0.61 + 0.4)
    );
  });

  return (
    <mesh frustumCulled={false} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={material}
        vertexShader={blobVertexShader}
        fragmentShader={blobFragmentShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}

export function BlobBackground() {
  const gfx = resolveGraphics();

  return (
    <div
      data-site-entrance-canvas
      aria-hidden
      className="gl-gradient pointer-events-none fixed inset-0 z-0 overflow-hidden opacity-60"
    >
      <Canvas
        orthographic
        camera={{ position: [0, 0, 1], zoom: 1 }}
        gl={{
          antialias: false,
          alpha: true,
          depth: false,
          stencil: false,
          powerPreference: "high-performance",
        }}
        dpr={gfx.blobDpr}
      >
        <BlobPlane />
        {/* Mounting the composer also switches the renderer to NoToneMapping,
            which is what keeps the mints from being crushed. */}
        <EffectComposer multisampling={0} enableNormalPass={false}>
          <Bloom
            intensity={gfx.bloomIntensity}
            luminanceThreshold={BLOOM_THRESHOLD}
            luminanceSmoothing={BLOOM_SMOOTHING}
            mipmapBlur
            levels={gfx.bloomLevels}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
