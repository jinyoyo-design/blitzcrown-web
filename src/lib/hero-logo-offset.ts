/** Hero resting position: logo sits to the right so copy can live on the left. */
export function heroLogoOffsetTarget() {
  const w = window.innerWidth;
  if (w >= 1280) return 1.25;
  if (w >= 768) return 0.95;
  return 0.45;
}

/** Contact section: nudge logo left for the CTA, but keep the mark inside the viewport. */
export function contactLogoOffsetTarget() {
  const w = window.innerWidth;
  if (w >= 1280) return -1.1;
  if (w >= 768) return -0.72;
  return -0.35;
}

export function lerpLogoOffset(progress: number) {
  const t = Math.min(1, Math.max(0, progress));
  return heroLogoOffsetTarget() + (contactLogoOffsetTarget() - heroLogoOffsetTarget()) * t;
}
