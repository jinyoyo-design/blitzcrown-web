"use client";

import { Canvas } from "@react-three/fiber";
import { STARFIELD } from "@/config/starfield";
import { resolveGraphics } from "@/config/graphics";
import { AmbientParticles } from "./ambient-particles";
import { ShapeParticles } from "./shape-particles";

/**
 * Shared perspective canvas that sits above the gradient and below the page
 * content. The starfield and the hero shape geometry live in here together so
 * they share one camera and depth range.
 */
export function RigCanvas() {
  const gfx = resolveGraphics();

  return (
    <div
      data-rig-canvas
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-2 h-screen w-screen"
    >
      <Canvas
        camera={{ fov: STARFIELD.fov, near: 0.1, far: STARFIELD.spawnFarMax + 200, position: [0, 0, 0] }}
        gl={{
          antialias: false,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
        }}
        dpr={gfx.rigDpr}
      >
        <AmbientParticles />
        <ShapeParticles shape="lightning" />
      </Canvas>
    </div>
  );
}
