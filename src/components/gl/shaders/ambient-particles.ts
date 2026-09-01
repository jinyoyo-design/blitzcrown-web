/**
 * Point-sprite starfield. Standard perspective point sizing: apparent size is
 * inversely proportional to view-space depth, with a reference depth picking
 * the distance at which a particle renders at its nominal pixel size.
 */
export const ambientParticlesVertexShader = /* glsl */ `
uniform float uReferenceDepth;
uniform float uFadeDepth;
uniform float uNearFadeDepth;

attribute float size;
attribute float brightness;
attribute vec3 tint;

varying vec3 vTint;
varying float vBrightness;

void main() {
  vTint = tint;

  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  float depth = max(-viewPosition.z, 0.001);

  gl_PointSize = clamp(size * (uReferenceDepth / depth), 0.0, 48.0);

  // Ramp brightness up as a particle crosses from the spawn plane toward the
  // camera, so recycled particles don't pop into existence at full strength.
  float nearness = clamp(1.0 - depth / uFadeDepth, 0.0, 1.0);

  // ...and back down once it is nearly on top of the camera, so the ones that
  // can't exit through a screen edge dissolve instead of being clipped away.
  float nearFade = smoothstep(0.0, uNearFadeDepth, depth);

  vBrightness = brightness * mix(0.2, 1.0, nearness) * nearFade;

  gl_Position = projectionMatrix * viewPosition;
}
`;

/**
 * Round sprite with a soft edge; everything outside the unit disc is dropped.
 * Meant to be drawn with additive blending, which is what guarantees a
 * particle can only ever lighten the background ??with normal alpha blending
 * any particle dimmer than the pixel behind it punches a dark speck instead.
 */
export const ambientParticlesFragmentShader = /* glsl */ `
precision highp float;

varying vec3 vTint;
varying float vBrightness;

void main() {
  vec2 offset = gl_PointCoord - vec2(0.5);
  float radiusSq = dot(offset, offset);
  if (radiusSq > 0.25) discard;

  float falloff = smoothstep(0.25, 0.03, radiusSq);
  float alpha = falloff * 0.42 * clamp(vBrightness, 0.0, 2.5);

  gl_FragColor = vec4(vTint, alpha);
}
`;
