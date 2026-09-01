/**
 * Soft glowing points that form the hero geometry silhouette.
 * Drawn with additive blending so they can only lighten the background.
 * Small bright cores with a wide, blurred halo.
 */
export const shapeParticlesVertexShader = /* glsl */ `
uniform float uReferenceDepth;
uniform float uSizeScale;

attribute float size;
attribute float brightness;
attribute float opacity;
attribute vec3 tint;

varying vec3 vTint;
varying float vBrightness;
varying float vOpacity;

void main() {
  vTint = tint;
  vOpacity = opacity;

  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(-viewPosition.z, 0.5);

  // Extra headroom so the soft halo isn't clipped by gl_PointSize.
  gl_PointSize = clamp(size * uSizeScale * (uReferenceDepth / depth), 0.0, 96.0);
  vBrightness = brightness * clamp(uReferenceDepth / depth, 0.65, 1.35);

  gl_Position = projectionMatrix * viewPosition;
}
`;

export const shapeParticlesFragmentShader = /* glsl */ `
precision highp float;

uniform float uGlowBoost;
uniform float uHaloStrength;

varying vec3 vTint;
varying float vBrightness;
varying float vOpacity;

void main() {
  vec2 offset = gl_PointCoord - vec2(0.5);
  float r = length(offset) * 2.0;
  if (r > 1.0) discard;

  // Tight white core + mid bloom + wide soft blur.
  float core = exp(-r * r * 48.0);
  float mid = exp(-r * r * 10.0);
  float halo = exp(-r * r * 2.4);
  float shape = core * 1.35 + mid * 0.55 + halo * uHaloStrength;

  float intensity = shape * vOpacity * clamp(vBrightness, 0.0, 3.0);
  vec3 rgb = vTint * (0.85 + vBrightness * 1.05);
  rgb *= 1.0 + core * uGlowBoost;

  // Soft edge alpha so the halo reads as blurred light, not a hard disc.
  float alpha = intensity * (0.55 + core * 0.45);
  gl_FragColor = vec4(rgb, alpha);
}
`;
