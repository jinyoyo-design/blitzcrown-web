import gsap from "gsap";

export type TickerPayload = {
  /** Elapsed time since the ticker started, in milliseconds. */
  timeMs: number;
  /** Time since the previous tick, in milliseconds. */
  deltaMs: number;
  frame: number;
};

type TickerCallback = (payload: TickerPayload) => void;

const callbacks = new Set<TickerCallback>();
let started = false;

function tick(time: number, deltaMs: number, frame: number) {
  const payload: TickerPayload = { timeMs: time * 1000, deltaMs, frame };
  for (const cb of callbacks) cb(payload);
}

/**
 * Single rAF loop for the whole site.
 *
 * Lenis, the WebGL layers and every scroll-driven animation share this ticker
 * so they resolve in a fixed order within one frame. Running separate loops
 * lets the scroll position update after the GL layer has sampled it, which
 * shows up as jitter on the pinned sections.
 */
export function registerTickerCallback(cb: TickerCallback) {
  callbacks.add(cb);

  if (!started) {
    started = true;
    // GSAP's own rAF drives everything; lag smoothing off keeps scroll-linked
    // values honest after a stall instead of catching up in one jump.
    gsap.ticker.lagSmoothing(0);
    gsap.ticker.add(tick);
  }

  return () => {
    callbacks.delete(cb);
    if (callbacks.size === 0) {
      gsap.ticker.remove(tick);
      started = false;
    }
  };
}
