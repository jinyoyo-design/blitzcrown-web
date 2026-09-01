export const blobVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/**
 * Slow organic gradient.
 *
 * The field is fractal value noise whose sample coordinates are themselves
 * offset by another noise lookup ("domain warping"). Plain fbm gives you
 * cloud-like blur; warping the domain first is what bends the bands into
 * rounded blob shapes that drift and fold into each other.
 *
 * The result drives a two-stop colour ramp, then a radial falloff pulls the
 * frame edges down to near-black so the content on top stays readable.
 */
export const blobFragmentShader = /* glsl */ `
precision highp float;

uniform float u_time;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform float u_weight1;
uniform float u_weight2;
uniform float u_blobRandomness;
uniform float u_blobDisplacement;
uniform float u_blobMorphSpeed;
uniform float u_colorBlend;
uniform float u_aspect;
uniform vec2 u_poolCenter;

varying vec2 vUv;

float hash(vec2 p) {
  p = fract(p * vec2(233.34, 851.73));
  p += dot(p, p + 23.45);
  return fract(p.x * p.y);
}

// Value noise with a smoothstep-interpolated lattice.
float valueNoise(vec2 p) {
  vec2 cell = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);

  float a = hash(cell);
  float b = hash(cell + vec2(1.0, 0.0));
  float c = hash(cell + vec2(0.0, 1.0));
  float d = hash(cell + vec2(1.0, 1.0));

  return mix(mix(a, b, w.x), mix(c, d, w.x), w.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    sum += amplitude * valueNoise(p);
    p *= 2.03;
    amplitude *= 0.5;
  }
  return sum;
}

void main() {
  // Work in aspect-corrected space so blobs stay round on wide viewports.
  vec2 p = vec2((vUv.x - 0.5) * u_aspect, vUv.y - 0.5);

  float t = u_time * 0.06 * u_blobMorphSpeed;

  // Two decorrelated warp offsets, each drifting on its own path. Low
  // frequency, so the folds are big soft masses rather than fine texture.
  vec2 warp = vec2(
    fbm(p * 1.0 + vec2(0.0, t)),
    fbm(p * 1.0 + vec2(4.7, -t * 0.85))
  );
  warp = (warp - 0.5) * 2.0 * u_blobDisplacement;

  float field = fbm(p * 0.85 + warp + vec2(t * 0.35, -t * 0.2));
  float contrast = mix(0.7, 1.6, u_blobRandomness);
  field = clamp((field - 0.5) * contrast + 0.5, 0.0, 1.0);

  // The lit mass wanders across the frame instead of sitting still; that slow
  // travel is what reads as "organic" more than the noise texture does. Its
  // position is uniform across the screen, so it is computed on the CPU rather
  // than recomputed identically in every one of a million fragments.
  float radial = length((vUv - u_poolCenter) * vec2(u_aspect * 0.62, 1.0));
  float pool = smoothstep(1.15, 0.0, radial);

  // Weights bias how quickly the ramp climbs toward the lit colour.
  float total = max(u_weight1 + u_weight2, 0.0001);
  float bias = u_weight2 / total;
  float ramp = pow(pool, mix(3.2, 1.4, bias));

  // Noise breaks the pool into separate masses. Applied hardest at the
  // boundary so the core stays coherent while the edges churn.
  ramp *= mix(1.0, mix(0.25, 1.7, field), 0.45 + 0.55 * pool);
  ramp = clamp(ramp, 0.0, 1.0);

  // A second, much larger and dimmer pool keeps the far corners from going
  // completely flat black.
  float ambient = smoothstep(1.8, 0.2, length((vUv - vec2(0.5)) * vec2(u_aspect * 0.5, 1.0)));

  vec3 color = mix(u_color1, u_color2, ramp * u_colorBlend);
  color *= mix(0.08, 1.0, max(pool, ambient * 0.45));

  gl_FragColor = vec4(color, 1.0);
}
`;
