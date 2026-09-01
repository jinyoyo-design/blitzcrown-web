/**
 * Full-viewport film grain that sits above everything, including the WebGL
 * layers. Multiply blending keeps it from washing out the dark background.
 */
export function NoiseOverlay() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[100000] mix-blend-multiply"
      style={{
        backgroundImage: "url(/images/assets/noise.png)",
        backgroundRepeat: "repeat",
        backgroundPosition: "center center",
      }}
    />
  );
}
