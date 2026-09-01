"use client";

import * as React from "react";
import { useEffect, useRef } from "react";

const RADIUS = 1;
const SEG = 28;
const FOV = 50;
const DPR_CAP = 2;
const TEX_CAP = 2048;
const SPIN_AT_50 = 0.14;
const MOVE_DT_FLOOR = 4;
const MAX_FLICK = 12;
const DIST_MAX = 0.9;
const GRAZE_DIM = 0.42;
const AA_FALLBACK = 0.004;

const VERT = `
precision highp float;

attribute vec2 aCell;

uniform float uArc0;
uniform float uSpan;
uniform float uYaw;
uniform float uHeight;
uniform float uPitch;
uniform float uDist;
uniform float uRadius;
uniform float uFocal;
uniform float uAspect;

varying vec2  vUv;
varying float vFace;

void main() {
    float th = uArc0 + aCell.x * uSpan + uYaw;
    vec3 p = vec3(uRadius * sin(th), (0.5 - aCell.y) * uHeight, uRadius * cos(th));

    vec3 rel = p - vec3(0.0, 0.0, uDist);
    float c = cos(uPitch);
    float s = sin(uPitch);
    vec3 q = vec3(rel.x, rel.y * c - rel.z * s, rel.y * s + rel.z * c);

    float w = -q.z;
    gl_Position = vec4(q.x * uFocal / uAspect, q.y * uFocal, 0.0, w);

    vUv = vec2(1.0 - aCell.x, aCell.y);

    vec3 n = -vec3(sin(th), 0.0, cos(th));
    vec3 toCam = normalize(vec3(0.0, 0.0, uDist) - p);
    vFace = clamp(dot(n, toCam), 0.0, 1.0);
}
`;

const FRAG = (deriv: boolean) =>
  `${deriv ? "#extension GL_OES_standard_derivatives : enable\n" : ""}precision highp float;

${deriv ? "#define AAW(x) fwidth(x)" : `#define AAW(x) ${AA_FALLBACK.toFixed(4)}`}

uniform sampler2D uTex;
uniform float uHas;
uniform vec3  uTint;
uniform float uTexAspect;
uniform float uPanelAspect;
uniform float uRound;
uniform float uGraze;

varying vec2  vUv;
varying float vFace;

void main() {
    vec2 uv = vUv - 0.5;
    float ra = uTexAspect / uPanelAspect;
    if (ra > 1.0) uv.x /= ra; else uv.y *= ra;
    uv += 0.5;

    vec3 pic = texture2D(uTex, uv).rgb;
    vec3 hold = uTint * (1.0 - 0.28 * vUv.y);
    vec3 rgb = mix(hold, pic, uHas);

    vec2 hs = vec2(uPanelAspect, 1.0) * 0.5;
    vec2 pp = (vUv - 0.5) * vec2(uPanelAspect, 1.0);
    float r = uRound * min(hs.x, hs.y);
    vec2 d = abs(pp) - hs + r;
    float sd = min(max(d.x, d.y), 0.0) + length(max(d, vec2(0.0))) - r;
    float w = max(AAW(sd), 1e-5);
    float a = 1.0 - smoothstep(-w, w, sd);

    float shade = mix(uGraze, 1.0, vFace);
    gl_FragColor = vec4(rgb * shade * a, a);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("RotundaCarousel shader:", gl.getShaderInfoLog(sh));
  }
  return sh;
}

function potFit(n: number, cap: number): number {
  let p = 64;
  while (p * 2 <= Math.min(n, cap)) p *= 2;
  const up = Math.min(p * 2, cap);
  return Math.abs(up - n) < Math.abs(n - p) ? up : p;
}

function slotTint(i: number, n: number): [number, number, number] {
  const h = ((i / Math.max(1, n)) * 360 + 210) % 360;
  const s = 0.3;
  const l = 0.42;
  const k = (m: number) => (m + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (m: number) => l - a * Math.max(-1, Math.min(Math.min(k(m) - 3, 9 - k(m)), 1));
  return [f(0), f(8), f(4)];
}

function wrapPi(x: number): number {
  const t = Math.PI * 2;
  return ((((x + Math.PI) % t) + t) % t) - Math.PI;
}

export type RotundaCarouselItem = {
  image?: string;
};

export type RotundaCarouselProps = {
  images?: RotundaCarouselItem[];
  background?: string;
  gap?: number;
  panelWidth?: number;
  panelHeight?: number;
  rounded?: number;
  distance?: number;
  tilt?: number;
  speed?: number;
  /** Distribute panels across this arc (radians). Defaults to a full ring. */
  arcSpan?: number;
  /** Size panels so this many fit across the viewport width. */
  fitToWidth?: number;
  /** Tile images around a full ring for a seamless loop. */
  loop?: boolean;
  /** Auto-spin direction. Drag inertia follows the same direction when set. */
  spinDirection?: "left" | "right";
  cursor?: Partial<{ damping: number; hover: number }>;
  className?: string;
  style?: React.CSSProperties;
};

export function RotundaCarousel({
  images = [],
  background = "transparent",
  gap = 0,
  panelWidth = 772,
  panelHeight = 1032,
  rounded = 3,
  distance = 90,
  tilt = 0,
  speed = 100,
  arcSpan,
  fitToWidth,
  loop = false,
  spinDirection = "right",
  cursor,
  className,
  style,
}: RotundaCarouselProps) {
  const { damping = 45, hover = 70 } = cursor ?? {};

  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const srcKey = JSON.stringify((Array.isArray(images) ? images : []).map((i) => i?.image ?? ""));

  const live = useRef({
    images,
    srcKey,
    gap,
    panelWidth,
    panelHeight,
    rounded,
    distance,
    tilt,
    speed,
    damping,
    hover,
    arcSpan,
    fitToWidth,
    loop,
    spinDirection,
  });
  live.current = {
    images,
    srcKey,
    gap,
    panelWidth,
    panelHeight,
    rounded,
    distance,
    tilt,
    speed,
    damping,
    hover,
    arcSpan,
    fitToWidth,
    loop,
    spinDirection,
  };

  const drag = useRef({
    down: 0,
    over: 0,
    grab: 0,
    vel: 0,
    lastT: 0,
    hoverAmt: 0,
  });

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      depth: false,
    }) as WebGLRenderingContext | null;
    if (!gl) return;

    const deriv = !!gl.getExtension("OES_standard_derivatives");

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG(deriv));
    const prog = gl.createProgram();
    if (!vs || !fs || !prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("RotundaCarousel link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const aCell = gl.getAttribLocation(prog, "aCell");
    const U = (n: string) => gl.getUniformLocation(prog, n);
    const u = {
      arc0: U("uArc0"),
      span: U("uSpan"),
      yaw: U("uYaw"),
      height: U("uHeight"),
      pitch: U("uPitch"),
      dist: U("uDist"),
      radius: U("uRadius"),
      focal: U("uFocal"),
      aspect: U("uAspect"),
      tex: U("uTex"),
      has: U("uHas"),
      tint: U("uTint"),
      texAspect: U("uTexAspect"),
      panelAspect: U("uPanelAspect"),
      round: U("uRound"),
      graze: U("uGraze"),
    };

    const verts = new Float32Array((SEG + 1) * 4);
    for (let i = 0; i <= SEG; i++) {
      const t = i / SEG;
      verts[i * 4] = t;
      verts[i * 4 + 1] = 0;
      verts[i * 4 + 2] = t;
      verts[i * 4 + 3] = 1;
    }
    const cellBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const vertCount = (SEG + 1) * 2;

    const maxTex = Math.max(256, Math.min(TEX_CAP, gl.getParameter(gl.MAX_TEXTURE_SIZE) as number));
    const anisoExt = gl.getExtension("EXT_texture_filter_anisotropic") as {
      TEXTURE_MAX_ANISOTROPY_EXT: number;
      MAX_TEXTURE_MAX_ANISOTROPY_EXT: number;
    } | null;
    const aniso = anisoExt
      ? {
          pname: anisoExt.TEXTURE_MAX_ANISOTROPY_EXT,
          max: Math.min(8, gl.getParameter(anisoExt.MAX_TEXTURE_MAX_ANISOTROPY_EXT) as number),
        }
      : null;

    const blank = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, blank);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0])
    );
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    const cache = new Map<string, { tex: WebGLTexture; aspect: number }>();
    const pending = new Set<string>();

    const ensure = (src: string) => {
      if (!src || cache.has(src) || pending.has(src)) return;
      pending.add(src);
      const im = new Image();
      im.crossOrigin = "anonymous";
      im.onerror = () => {
        pending.delete(src);
      };
      im.onload = () => {
        pending.delete(src);
        if (!im.naturalWidth || !im.naturalHeight) return;
        const w = potFit(im.naturalWidth, maxTex);
        const h = potFit(im.naturalHeight, maxTex);
        const c = document.createElement("canvas");
        c.width = w;
        c.height = h;
        const cx = c.getContext("2d");
        if (!cx) return;
        cx.drawImage(im, 0, 0, w, h);
        const t = gl.createTexture();
        if (!t) return;
        gl.bindTexture(gl.TEXTURE_2D, t);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 0);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.pname, aniso.max);
        cache.set(src, { tex: t, aspect: im.naturalWidth / im.naturalHeight });
      };
      im.src = src;
    };

    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.CULL_FACE);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    let cssW = 0;
    let cssH = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP);
      cssW = canvas.clientWidth || host.clientWidth || 0;
      cssH = canvas.clientHeight || host.clientHeight || 0;
      const w = Math.max(1, Math.round(cssW * dpr));
      const h = Math.max(1, Math.round(cssH * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      gl.viewport(0, 0, w, h);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const view = { focal: 1, aspect: 1, dist: 0, pitch: 0 };
    let yaw = 0;

    const screenTheta = (ox: number, oy: number): number | null => {
      const w = host.offsetWidth || 1;
      const h = host.offsetHeight || 1;
      const nx = (ox / w) * 2 - 1;
      const ny = 1 - (oy / h) * 2;

      const dx = (nx * view.aspect) / view.focal;
      const dy = ny / view.focal;
      const dz = -1;
      const c = Math.cos(view.pitch);
      const s = Math.sin(view.pitch);
      const wz = -dy * s + dz * c;

      const a = dx * dx + wz * wz;
      const b = 2 * view.dist * wz;
      const cc = view.dist * view.dist - RADIUS * RADIUS;
      if (a <= 1e-9) return null;
      const disc = b * b - 4 * a * cc;
      if (disc < 0) return null;
      const t = (-b + Math.sqrt(disc)) / (2 * a);
      if (!(t > 0)) return null;
      return Math.atan2(t * dx, view.dist + t * wz);
    };

    const onDown = (e: PointerEvent) => {
      const th = screenTheta(e.offsetX, e.offsetY);
      if (th == null) return;
      const d = drag.current;
      d.down = 1;
      d.vel = 0;
      d.lastT = e.timeStamp;
      d.grab = th - yaw;
      host.style.cursor = "grabbing";
      try {
        host.setPointerCapture(e.pointerId);
      } catch {
        /* no capture */
      }
    };
    const onMove = (e: PointerEvent) => {
      const L = live.current;
      const d = drag.current;
      d.over = 1;
      if (!d.down) return;
      const th = screenTheta(e.offsetX, e.offsetY);
      if (th == null) return;
      const delta = wrapPi(th - d.grab - yaw);
      const spinDir = L.spinDirection === "left" ? -1 : 1;
      if (L.loop && delta * spinDir < 0) return;
      yaw += delta;
      const dt = Math.max(MOVE_DT_FLOOR, e.timeStamp - d.lastT) / 1000;
      d.lastT = e.timeStamp;
      const v = d.vel * 0.4 + (delta / dt) * 0.6;
      d.vel =
        L.loop && v * spinDir < 0
          ? 0
          : Math.max(-MAX_FLICK, Math.min(MAX_FLICK, v));
    };
    const onUp = () => {
      drag.current.down = 0;
      host.style.cursor = "grab";
    };
    const onLeave = () => {
      drag.current.over = 0;
      drag.current.down = 0;
      host.style.cursor = "grab";
    };
    host.addEventListener("pointerdown", onDown);
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);
    host.addEventListener("pointercancel", onUp);
    window.addEventListener("pointerup", onUp);

    let raf = 0;
    let last = performance.now();

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (cssW <= 0 || cssH <= 0) {
        resize();
        if (cssW <= 0 || cssH <= 0) return;
      }

      const L = live.current;
      const list = Array.isArray(L.images) && L.images.length ? L.images : [];
      const uniqueN = list.length;
      if (uniqueN === 0) {
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        return;
      }

      const spinDir = L.spinDirection === "left" ? -1 : 1;
      const d = drag.current;
      const target = d.over ? 1 : 0;
      d.hoverAmt += (target - d.hoverAmt) * Math.min(1, dt * 6);

      if (!d.down) {
        yaw += d.vel * dt;
        d.vel *= Math.exp(-dt * (0.5 + (L.damping / 100) * 7));
        if (L.loop && d.vel * spinDir < 0) d.vel = 0;
        const slow = 1 - (L.hover / 100) * d.hoverAmt;
        yaw += spinDir * (L.speed / 50) * SPIN_AT_50 * slow * dt;
      }
      yaw = yaw % (Math.PI * 2);

      const loop = !!L.loop;
      const drawN = loop ? uniqueN * 2 : uniqueN;
      let pw = Math.max(1, L.panelWidth);
      let ph = Math.max(1, L.panelHeight);
      if (L.fitToWidth && L.fitToWidth > 0 && cssW > 0) {
        pw = Math.max(56, (cssW / L.fitToWidth) * 0.96);
        ph = pw * (L.panelHeight / L.panelWidth);
      }
      const spreadArc = loop ? Math.PI * 2 : L.arcSpan ?? Math.PI * 2;
      const panelArc = spreadArc / drawN;
      const arcStart = !loop && L.arcSpan != null ? -spreadArc * 0.5 : 0;
      const circum = Math.max(1, drawN * (pw + Math.max(0, L.gap)));
      const span =
        loop && L.gap === 0 ? panelArc : Math.min(panelArc, (spreadArc * pw) / circum);
      const worldH = Math.max(1e-4, (spreadArc * ph) / circum);
      const panelAspect = (RADIUS * span) / worldH;

      const vAspect = Math.max(0.05, cssW / Math.max(1, cssH));
      const focal = 1 / Math.tan(((FOV / 2) * Math.PI) / 180);
      const dist = Math.max(0, Math.min(DIST_MAX, L.distance / 100) * RADIUS);
      const pitch = (L.tilt * Math.PI) / 180;

      view.focal = focal;
      view.aspect = vAspect;
      view.dist = dist;
      view.pitch = pitch;

      gl.useProgram(prog);
      gl.uniform1f(u.yaw!, yaw);
      gl.uniform1f(u.height!, worldH);
      gl.uniform1f(u.pitch!, pitch);
      gl.uniform1f(u.dist!, dist);
      gl.uniform1f(u.radius!, RADIUS);
      gl.uniform1f(u.focal!, focal);
      gl.uniform1f(u.aspect!, vAspect);
      gl.uniform1f(u.span!, span);
      gl.uniform1f(u.panelAspect!, panelAspect);
      gl.uniform1f(u.round!, Math.max(0, Math.min(100, L.rounded)) / 100);
      gl.uniform1f(u.graze!, GRAZE_DIM);
      gl.uniform1i(u.tex!, 0);
      gl.activeTexture(gl.TEXTURE0);

      gl.bindBuffer(gl.ARRAY_BUFFER, cellBuf);
      gl.enableVertexAttribArray(aCell);
      gl.vertexAttribPointer(aCell, 2, gl.FLOAT, false, 0, 0);

      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      for (let i = 0; i < drawN; i++) {
        const src = list[i % uniqueN]?.image ?? "";
        if (src) ensure(src);
        const hit = src ? cache.get(src) : undefined;
        gl.uniform1f(u.arc0!, arcStart + i * panelArc + (panelArc - span) * 0.5);
        if (hit) {
          gl.bindTexture(gl.TEXTURE_2D, hit.tex);
          gl.uniform1f(u.has!, 1);
          gl.uniform1f(u.texAspect!, hit.aspect);
          gl.uniform3f(u.tint!, 0, 0, 0);
        } else {
          gl.bindTexture(gl.TEXTURE_2D, blank);
          gl.uniform1f(u.has!, 0);
          gl.uniform1f(u.texAspect!, panelAspect);
          const t = slotTint(i % uniqueN, uniqueN);
          gl.uniform3f(u.tint!, t[0], t[1], t[2]);
        }
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertCount);
      }
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      host.removeEventListener("pointerdown", onDown);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
      host.removeEventListener("pointercancel", onUp);
      window.removeEventListener("pointerup", onUp);
      cache.forEach((v) => gl.deleteTexture(v.tex));
      cache.clear();
      gl.deleteTexture(blank);
      gl.deleteBuffer(cellBuf);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        minHeight: 480,
        position: "relative",
        overflow: "hidden",
        background,
        cursor: "grab",
        touchAction: "none",
        userSelect: "none",
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
