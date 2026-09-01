"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { resolveGraphics } from "@/config/graphics";
import {
  SHAPE_AURA_RADIUS_MAX,
  SHAPE_AURA_RADIUS_MIN,
  SHAPE_AURA_RATIO,
  SHAPE_AURA_SIZE_MUL,
  SHAPE_AURA_SPEED_MAX,
  SHAPE_AURA_SPEED_MIN,
  SHAPE_AURA_SWIRL,
  SHAPE_FORMATION_STAGGER,
  SHAPE_GROUP_LOOK_TILT,
  SHAPE_GROUP_TILT_SPEED,
  SHAPE_LIGHTNING_IDLE_SPIN,
  SHAPE_LIGHTNING_IDLE_WOBBLE,
  SHAPE_LIGHTNING_IDLE_WOBBLE_SPEED,
  CONTACT_LIGHTNING_PARTICLE_SIZE_MUL,
  CONTACT_LIGHTNING_SCALE,
  SHAPE_PARTICLE_COUNT,
  SHAPE_PARTICLE_DRIFT_MAX,
  SHAPE_PARTICLE_DRIFT_MIN,
  SHAPE_PARTICLE_SCALE,
  SHAPE_PARTICLE_SIZES,
  SHAPE_PARTICLE_TWINKLE_INTENSITY,
  SHAPE_PARTICLE_TWINKLE_RATIO,
  SHAPE_POINTER_GAUSS,
  SHAPE_POINTER_HOVER_PUSH,
  SHAPE_POINTER_MAX_OFFSET,
  SHAPE_POINTER_PUSH,
  SHAPE_POINTER_RADIUS,
  SHAPE_POINTER_RETURN,
  SHAPE_POINTER_SOFT,
  SHAPE_POINTER_SPEED_REF,
} from "@/config/visuals";
import { SHAPE_MESHES, type ShapeName } from "@/lib/geometry/particle-shapes";
import { evaluateSample, sampleMeshSurface } from "@/lib/geometry/sample-mesh";
import { sampleIntroOffscreenSpawn } from "@/lib/particle-plane";
import { useGlobalStore } from "@/stores/global-store";
import { useParticleScrollStore } from "@/stores/particle-scroll-store";
import {
  shapeParticlesFragmentShader,
  shapeParticlesVertexShader,
} from "./shaders/shape-particles";

const DEPTH = 6;
const FORWARD = new THREE.Vector3(0, 0, 1);
const IDENTITY_QUAT = new THREE.Quaternion();
const REST_SHAPE: ShapeName = "lightning";
const MORPH_TARGETS = ["star", "diamond", "orb"] as const;
type MorphTarget = (typeof MORPH_TARGETS)[number];

type Particle = {
  baseA: { x: number; y: number; z: number };
  morph: Record<MorphTarget, { x: number; y: number; z: number }>;
  spawnX: number;
  spawnY: number;
  spawnZ: number;
  introSpawnX: number;
  introSpawnY: number;
  introSpawnZ: number;
  formDelay: number;
  dissolveDelay: number;
  drift: number;
  phase: number;
  twinklePhase: number;
  twinkleSpeed: number;
  hasTwinkle: boolean;
  baseSize: number;
  offX: number;
  offY: number;
  /** Dust that orbits / sheds from the formed silhouette. */
  isAura: boolean;
  auraLife: number;
  auraSpeed: number;
  auraRadiusMin: number;
  auraRadiusMax: number;
  swirlAmp: number;
  tangentialAmp: number;
  zAmp: number;
};

type PointerState = {
  x: number;
  y: number;
  smoothX: number;
  smoothY: number;
  prevSmoothX: number;
  prevSmoothY: number;
  speed: number;
  active: boolean;
  engagement: number;
};

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / Math.max(edge1 - edge0, 1e-5)));
  return t * t * (3 - 2 * t);
}

function lerpAngle(current: number, target: number, t: number) {
  let delta = target - current;
  while (delta > Math.PI) delta -= Math.PI * 2;
  while (delta < -Math.PI) delta += Math.PI * 2;
  return current + delta * t;
}

function twinkleAmount(p: Particle, time: number) {
  if (!p.hasTwinkle) return 0;
  const r = time * p.twinkleSpeed + p.twinklePhase;
  const wave =
    (0.5 * Math.sin(r) +
      0.32 * Math.sin(2.17 * r + p.phase) +
      0.18 * Math.sin(4.83 * r + p.twinklePhase) +
      1) *
    0.5;
  return Math.pow(Math.max(0, wave), 2.6);
}

type ShapeParticlesProps = {
  shape?: ShapeName;
};

/**
 * Hero particle field driven by pointer idle behaviour + scroll state
 * (dissolve / morph / Y rotation) from ParticleScrollController.
 */
export function ShapeParticles({ shape = REST_SHAPE }: ShapeParticlesProps) {
  const tiltGroup = useRef<THREE.Group>(null);
  const spinGroup = useRef<THREE.Group>(null);
  const material = useRef<THREE.ShaderMaterial>(null);
  const clock = useRef(0);
  // Formation is handled by scroll/entrance `dissolve` (1??). Keep silhouette
  // fully "formed" so scatter/reform reads cleanly from spawn ??target.
  const formation = useRef(1);
  const lookTarget = useRef(new THREE.Quaternion());
  const lookDir = useRef(new THREE.Vector3());
  const idleSpinY = useRef(0);
  /** Locked Y rotation while the mark moves/scales into the contact slot. */
  const contactRotationY = useRef<number | null>(null);
  const smoothOffsetX = useRef(0);
  const smoothOffsetY = useRef(0);
  const smoothScale = useRef(1);

  const size = useThree((s) => s.size);
  const camera = useThree((s) => s.camera);

  const pointer = useRef<PointerState>({
    x: 0,
    y: 0,
    smoothX: 0,
    smoothY: 0,
    prevSmoothX: 0,
    prevSmoothY: 0,
    speed: 0,
    active: false,
    engagement: 0,
  });

  const { particles, geometry, uniforms } = useMemo(() => {
    const count = Math.min(resolveGraphics().shapeCount, SHAPE_PARTICLE_COUNT);
    const meshA = SHAPE_MESHES[shape];
    const samplesA = sampleMeshSurface(meshA, count);
    const morphSamples = Object.fromEntries(
      MORPH_TARGETS.map((name) => [name, sampleMeshSurface(SHAPE_MESHES[name], count)])
    ) as Record<MorphTarget, ReturnType<typeof sampleMeshSurface>>;
    const scratch = { x: 0, y: 0, z: 0 };

    const particles: Particle[] = new Array(count);
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const brightness = new Float32Array(count);
    const opacity = new Float32Array(count);
    const tints = new Float32Array(count * 3);

    const twinkleFlags = Array.from(
      { length: count },
      (_, i) => i < Math.floor(count * SHAPE_PARTICLE_TWINKLE_RATIO)
    );
    const auraFlags = Array.from(
      { length: count },
      (_, i) => i < Math.floor(count * SHAPE_AURA_RATIO)
    );
    for (let i = twinkleFlags.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [twinkleFlags[i], twinkleFlags[j]] = [twinkleFlags[j], twinkleFlags[i]];
    }
    for (let i = auraFlags.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [auraFlags[i], auraFlags[j]] = [auraFlags[j], auraFlags[i]];
    }

    const spawnSpread = SHAPE_PARTICLE_SCALE * 1.8;

    for (let i = 0; i < count; i++) {
      evaluateSample(meshA.positions, samplesA[i], scratch);
      const ax = scratch.x * SHAPE_PARTICLE_SCALE;
      const ay = scratch.y * SHAPE_PARTICLE_SCALE;
      const az = scratch.z * SHAPE_PARTICLE_SCALE;

      const morph: Particle["morph"] = {
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

      const spawnX = (Math.random() - 0.5) * spawnSpread * 2;
      const spawnY = (Math.random() - 0.5) * spawnSpread * 2;
      const spawnZ = (Math.random() - 0.5) * spawnSpread * 0.9;
      const introSpawn =
        typeof window !== "undefined"
          ? sampleIntroOffscreenSpawn(i)
          : { x: spawnX, y: spawnY, z: spawnZ };
      const hasTwinkle = twinkleFlags[i];
      const isAura = auraFlags[i];
      const baseSize =
        SHAPE_PARTICLE_SIZES[Math.floor(Math.random() * SHAPE_PARTICLE_SIZES.length)] *
        (isAura ? SHAPE_AURA_SIZE_MUL : 1);

      particles[i] = {
        baseA: { x: ax, y: ay, z: az },
        morph,
        spawnX,
        spawnY,
        spawnZ,
        introSpawnX: introSpawn.x,
        introSpawnY: introSpawn.y,
        introSpawnZ: introSpawn.z,
        formDelay: Math.random() * SHAPE_FORMATION_STAGGER,
        dissolveDelay: Math.random() * 0.85,
        drift:
          SHAPE_PARTICLE_DRIFT_MIN +
          Math.random() * (SHAPE_PARTICLE_DRIFT_MAX - SHAPE_PARTICLE_DRIFT_MIN),
        phase: Math.random() * Math.PI * 2,
        twinklePhase: Math.random() * Math.PI * 2,
        twinkleSpeed: 1.1 + Math.random() * 1.7,
        hasTwinkle,
        baseSize,
        offX: 0,
        offY: 0,
        isAura,
        auraLife: Math.random(),
        auraSpeed:
          SHAPE_AURA_SPEED_MIN +
          Math.random() * (SHAPE_AURA_SPEED_MAX - SHAPE_AURA_SPEED_MIN),
        auraRadiusMin: SHAPE_AURA_RADIUS_MIN * (0.7 + Math.random() * 0.6),
        auraRadiusMax: SHAPE_AURA_RADIUS_MAX * (0.75 + Math.random() * 0.5),
        swirlAmp: SHAPE_AURA_SWIRL * (0.55 + Math.random() * 0.9),
        tangentialAmp: 0.16 + Math.random() * 0.28,
        zAmp: 0.08 + Math.random() * 0.18,
      };

      positions[i * 3] = introSpawn.x;
      positions[i * 3 + 1] = introSpawn.y;
      positions[i * 3 + 2] = introSpawn.z;
      sizes[i] = baseSize;
      brightness[i] = 0;
      opacity[i] = 0;

      tints[i * 3] = 1;
      tints[i * 3 + 1] = 1;
      tints[i * 3 + 2] = 1;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("brightness", new THREE.BufferAttribute(brightness, 1));
    geometry.setAttribute("opacity", new THREE.BufferAttribute(opacity, 1));
    geometry.setAttribute("tint", new THREE.BufferAttribute(tints, 3));

    return {
      particles,
      geometry,
      uniforms: {
        uReferenceDepth: { value: DEPTH },
        uSizeScale: { value: 30 },
        uGlowBoost: { value: 2.1 },
        uHaloStrength: { value: 0.95 },
      },
    };
  }, [shape]);

  useEffect(() => {
    const project = (clientX: number, clientY: number) => {
      const ndcX = (clientX / Math.max(size.width, 1)) * 2 - 1;
      const ndcY = -(clientY / Math.max(size.height, 1)) * 2 + 1;
      const origin = new THREE.Vector3().setFromMatrixPosition(camera.matrixWorld);
      const dir = new THREE.Vector3(ndcX, ndcY, 0.5).unproject(camera).sub(origin).normalize();
      const planeZ = -DEPTH;
      const tHit = Math.abs(dir.z) > 1e-5 ? (planeZ - origin.z) / dir.z : 0;
      const hit = origin.clone().addScaledVector(dir, tHit);
      pointer.current.x = hit.x;
      pointer.current.y = hit.y;
      pointer.current.active = true;
    };

    const onMove = (e: MouseEvent) => project(e.clientX, e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (!e.touches.length) return;
      project(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onLeave = () => {
      pointer.current.active = false;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("touchmove", onTouch, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onTouch);
      window.removeEventListener("mouseleave", onLeave);
    };
  }, [camera, size.width, size.height]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(Math.max(rawDelta, 0.001), 0.05);
    clock.current += delta;

    const form = formation.current;

    const { dissolve, shapeMorph, geometryScrollRotationY, shapeTarget, geometryScale } =
      useParticleScrollStore.getState();
    const entranceDone = useGlobalStore.getState().entranceDone;
    const introOpen = useGlobalStore.getState().introOpen;
    const heroCoalesceActive = useGlobalStore.getState().heroCoalesceActive;

    const contactParticleMul =
      geometryScale <= CONTACT_LIGHTNING_SCALE + 0.08
        ? CONTACT_LIGHTNING_PARTICLE_SIZE_MUL
        : 1;

    const ptr = pointer.current;
    const smoothK = 1 - Math.exp(-16 * delta);
    const engageK = 1 - Math.exp(-10 * delta);
    const speedK = 1 - Math.exp(-14 * delta);
    if (ptr.active) {
      ptr.smoothX += (ptr.x - ptr.smoothX) * smoothK;
      ptr.smoothY += (ptr.y - ptr.smoothY) * smoothK;
    }
    const instSpeed =
      Math.hypot(ptr.smoothX - ptr.prevSmoothX, ptr.smoothY - ptr.prevSmoothY) / delta;
    ptr.speed += (instSpeed - ptr.speed) * speedK;
    ptr.prevSmoothX = ptr.smoothX;
    ptr.prevSmoothY = ptr.smoothY;
    ptr.engagement += ((ptr.active ? 1 : 0) - ptr.engagement) * engageK;

    const inContactSlot = geometryScale <= CONTACT_LIGHTNING_SCALE + 0.12;
    const atContactRest = inContactSlot && dissolve < 0.1;
    const contactReforming = inContactSlot && dissolve < 0.95;

    if (tiltGroup.current) {
      const { heroOffsetX, heroOffsetY } = useParticleScrollStore.getState();
      const travelingToContact = geometryScale < 0.98;
      const offsetK = 1 - Math.exp(-(travelingToContact ? 14 : 10) * delta);
      smoothOffsetX.current += (heroOffsetX - smoothOffsetX.current) * offsetK;
      smoothOffsetY.current += (heroOffsetY - smoothOffsetY.current) * offsetK;

      tiltGroup.current.position.x = smoothOffsetX.current;
      tiltGroup.current.position.y = smoothOffsetY.current;
      const tiltK = 1 - Math.exp(-SHAPE_GROUP_TILT_SPEED * delta);
      if (!contactReforming && ptr.engagement > 0.001) {
        const nx = (ptr.smoothX / (SHAPE_PARTICLE_SCALE * 0.85)) * ptr.engagement;
        const ny = (ptr.smoothY / (SHAPE_PARTICLE_SCALE * 0.85)) * ptr.engagement;
        lookDir.current
          .set(-nx * SHAPE_GROUP_LOOK_TILT, -ny * SHAPE_GROUP_LOOK_TILT, 1)
          .normalize();
        lookTarget.current.setFromUnitVectors(FORWARD, lookDir.current);
      } else {
        lookTarget.current.copy(IDENTITY_QUAT);
      }
      tiltGroup.current.quaternion.slerp(lookTarget.current, tiltK);
    }

    const t = clock.current;

    if (spinGroup.current) {
      const scaleK = 1 - Math.exp(-(atContactRest ? 12 : 9) * delta);
      smoothScale.current += (geometryScale - smoothScale.current) * scaleK;
      spinGroup.current.scale.setScalar(smoothScale.current);

      const contactPlacement = atContactRest;

      const contactBlend = smoothstep(
        CONTACT_LIGHTNING_SCALE + 0.08,
        CONTACT_LIGHTNING_SCALE,
        smoothScale.current
      );

      const lightningIdle =
        shapeTarget === REST_SHAPE && !contactPlacement && !contactReforming
          ? (1 - smoothstep(0, 0.12, dissolve)) *
            (1 - smoothstep(0, 0.18, shapeMorph)) *
            (1 - contactBlend)
          : 0;

      if (lightningIdle > 0.001) {
        idleSpinY.current += SHAPE_LIGHTNING_IDLE_SPIN * delta * lightningIdle;
      }

      if (contactReforming) {
        if (contactRotationY.current === null) {
          contactRotationY.current = spinGroup.current.rotation.y;
        }
        const rotSpeed = atContactRest ? 14 : 4 + (1 - dissolve) * 6;
        const rotK = 1 - Math.exp(-rotSpeed * delta);
        contactRotationY.current = lerpAngle(contactRotationY.current, 0, rotK);
        if (atContactRest && Math.abs(contactRotationY.current) < 0.003) {
          contactRotationY.current = 0;
        }
        spinGroup.current.rotation.y = contactRotationY.current;
        spinGroup.current.rotation.z = 0;
      } else {
        contactRotationY.current = null;
        spinGroup.current.rotation.y = geometryScrollRotationY + idleSpinY.current;
        spinGroup.current.rotation.z =
          Math.sin(t * SHAPE_LIGHTNING_IDLE_WOBBLE_SPEED) *
          SHAPE_LIGHTNING_IDLE_WOBBLE *
          lightningIdle;
      }
    }

    const positions = geometry.getAttribute("position") as THREE.BufferAttribute;
    const brightnessAttr = geometry.getAttribute("brightness") as THREE.BufferAttribute;
    const opacityAttr = geometry.getAttribute("opacity") as THREE.BufferAttribute;
    const sizeAttr = geometry.getAttribute("size") as THREE.BufferAttribute;
    const pos = positions.array as Float32Array;
    const bright = brightnessAttr.array as Float32Array;
    const opac = opacityAttr.array as Float32Array;
    const sizes = sizeAttr.array as Float32Array;
    const motionPush = Math.min(1, ptr.speed / SHAPE_POINTER_SPEED_REF);
    const pushStrength =
      ptr.engagement * (SHAPE_POINTER_HOVER_PUSH + (1 - SHAPE_POINTER_HOVER_PUSH) * motionPush);
    const morphKey: MorphTarget | null =
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
      const mz = p.baseA.z + (tb.z - p.baseA.z) * morph;

      const pulse = Math.sin(t * (1.1 + (p.hasTwinkle ? 0.35 : 0)) + p.phase);
      const driftX = Math.cos(0.7 * t + p.phase) * p.drift * pulse;
      const driftY = Math.sin(0.9 * t + 1.3 * p.phase) * p.drift * pulse;

      let formedX = mx + driftX;
      let formedY = my + driftY;
      let formedZ = mz;

      const localDissolve = smoothstep(p.dissolveDelay, p.dissolveDelay + 0.45, dissolve);
      const formedAmount = (1 - localDissolve) * localForm;

      // Aura dust: peel off the silhouette, swirl, drift outward, then loop.
      let auraFade = 1;
      if (p.isAura && formedAmount > 0.02) {
        p.auraLife += delta * p.auraSpeed;
        if (p.auraLife >= 1) p.auraLife -= Math.floor(p.auraLife);

        const life = p.auraLife;
        const radial =
          p.auraRadiusMin + life * life * (p.auraRadiusMax - p.auraRadiusMin);

        const len = Math.hypot(mx, my) || 1e-4;
        const nx = mx / len;
        const ny = my / len;
        const tx = -ny;
        const ty = nx;

        const swirl =
          Math.sin(t * (0.9 + p.auraSpeed) + p.phase) * p.swirlAmp * (0.35 + life);
        const along =
          Math.cos(t * (0.55 + p.auraSpeed * 0.6) + p.phase * 1.3) * p.tangentialAmp;
        const wander = Math.sin(t * 1.7 + p.twinklePhase) * 0.08 * (0.4 + life);

        formedX = mx + nx * radial + tx * (along + swirl) + ny * wander * 0.35;
        formedY = my + ny * radial + ty * (along + swirl) - nx * wander * 0.35;
        formedZ =
          mz +
          Math.sin(t * 1.25 + p.phase) * p.zAmp +
          Math.cos(t * 0.8 + p.twinklePhase) * p.zAmp * 0.45;

        auraFade = Math.sin(life * Math.PI);
        auraFade = Math.max(0, auraFade);
      }

      const useIntroSpawn = !entranceDone;
      const sx = useIntroSpawn ? p.introSpawnX : p.spawnX;
      const sy = useIntroSpawn ? p.introSpawnY : p.spawnY;
      const sz = useIntroSpawn ? p.introSpawnZ : p.spawnZ;

      let x = formedX + (sx - formedX) * localDissolve;
      let y = formedY + (sy - formedY) * localDissolve;
      let z = formedZ + (sz - formedZ) * localDissolve;

      x = sx + (x - sx) * localForm;
      y = sy + (y - sy) * localForm;
      z = sz + (z - sz) * localForm;

      const returnK = 1 - Math.exp(-SHAPE_POINTER_RETURN * delta);
      p.offX += -p.offX * returnK;
      p.offY += -p.offY * returnK;
      if (Math.abs(p.offX) < 0.002) p.offX = 0;
      if (Math.abs(p.offY) < 0.002) p.offY = 0;

      if (pushStrength > 0.02 && localDissolve < 0.85) {
        const dx = ptr.smoothX - (x + p.offX);
        const dy = ptr.smoothY - (y + p.offY);
        const distSq = dx * dx + dy * dy;
        const coreR = SHAPE_POINTER_RADIUS;
        const softR = coreR * SHAPE_POINTER_SOFT;
        if (distSq < softR * softR) {
          const dist = Math.sqrt(distSq) || 1e-4;
          const n = dist / coreR;
          const falloff = Math.exp(-SHAPE_POINTER_GAUSS * n * n);
          const force = falloff * SHAPE_POINTER_PUSH * pushStrength * delta * 60;
          p.offX -= (dx / dist) * force;
          p.offY -= (dy / dist) * force;
          const maxOff = SHAPE_POINTER_MAX_OFFSET;
          if (p.offX > maxOff) p.offX = maxOff;
          else if (p.offX < -maxOff) p.offX = -maxOff;
          if (p.offY > maxOff) p.offY = maxOff;
          else if (p.offY < -maxOff) p.offY = -maxOff;
        }
      }

      pos[i * 3] = x + p.offX;
      pos[i * 3 + 1] = y + p.offY;
      pos[i * 3 + 2] = z;

      let visibility: number;
      if (!entranceDone) {
        if (!introOpen || !heroCoalesceActive) {
          visibility = 0;
        } else {
          const scatter = 1 - localDissolve;
          const coalesce = 1 - dissolve;
          const gather = scatter * coalesce;
          visibility = localForm * gather * auraFade;
        }
      } else {
        visibility = localForm * (1 - localDissolve * 0.92) * auraFade;
      }

      const tw = twinkleAmount(p, t) * SHAPE_PARTICLE_TWINKLE_INTENSITY * 0.35;
      const baseBright = p.isAura
        ? 0.55 + tw * 0.85
        : p.hasTwinkle
          ? 1.35
          : 0.85 + tw;
      bright[i] = baseBright * visibility;
      opac[i] = visibility * (p.isAura ? 0.75 : 1);
      sizes[i] = p.baseSize * (0.55 + 0.45 * visibility) * contactParticleMul;
    }

    positions.needsUpdate = true;
    brightnessAttr.needsUpdate = true;
    opacityAttr.needsUpdate = true;
    sizeAttr.needsUpdate = true;
  });

  return (
    <group ref={tiltGroup} position={[0, 0, -DEPTH]} renderOrder={2}>
      <group ref={spinGroup}>
        <points frustumCulled={false} geometry={geometry}>
          <shaderMaterial
            ref={material}
            vertexShader={shapeParticlesVertexShader}
            fragmentShader={shapeParticlesFragmentShader}
            uniforms={uniforms}
            transparent
            depthTest
            depthWrite={false}
            blending={THREE.AdditiveBlending}
          />
        </points>
      </group>
    </group>
  );
}
