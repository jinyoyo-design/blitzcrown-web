"use client";

import { forwardRef, useCallback, useEffect, useMemo, useRef } from "react";
import { cn } from "@/lib/cn";

type Falloff = "linear" | "exponential" | "gaussian";

type VariableProximityProps = {
  label: string;
  /** Variable-font settings when the cursor is beyond `radius`. */
  fromFontVariationSettings: string;
  /** Variable-font settings the character reaches at zero distance. */
  toFontVariationSettings: string;
  containerRef: React.RefObject<HTMLElement | null>;
  radius?: number;
  falloff?: Falloff;
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLSpanElement>;
};

/** `"'wght' 400, 'wdth' 90"` -> `Map { wght => 400, wdth => 90 }` */
function parseSettings(settings: string) {
  return new Map(
    settings
      .split(",")
      .map((part) => part.trim())
      .map((part) => {
        const [axis, value] = part.split(" ");
        return [axis.replace(/['"]/g, ""), parseFloat(value)] as const;
      })
  );
}

function falloffAt(distance: number, radius: number, kind: Falloff) {
  const normalized = Math.min(Math.max(1 - distance / radius, 0), 1);
  switch (kind) {
    case "exponential":
      return normalized ** 2;
    case "gaussian":
      return Math.exp(-((distance / (radius / 2)) ** 2) / 2);
    default:
      return normalized;
  }
}

/**
 * Renders text one character at a time and drives each character's variable
 * font axes from its distance to the cursor, so letters thicken as the pointer
 * sweeps past them.
 */
export const VariableProximity = forwardRef<HTMLSpanElement, VariableProximityProps>(
  function VariableProximity(
    {
      label,
      fromFontVariationSettings,
      toFontVariationSettings,
      containerRef,
      radius = 50,
      falloff = "linear",
      className,
      style,
      onClick,
    },
    ref
  ) {
    const charRefs = useRef<(HTMLSpanElement | null)[]>([]);
    const mouse = useRef({ x: 0, y: 0 });
    const lastMouse = useRef<{ x: number | null; y: number | null }>({ x: null, y: null });

    const axes = useMemo(() => {
      const from = parseSettings(fromFontVariationSettings);
      const to = parseSettings(toFontVariationSettings);
      return Array.from(from.entries()).map(([axis, fromValue]) => ({
        axis,
        fromValue,
        toValue: to.get(axis) ?? fromValue,
      }));
    }, [fromFontVariationSettings, toFontVariationSettings]);

    useEffect(() => {
      const track = (clientX: number, clientY: number) => {
        const container = containerRef.current;
        if (container) {
          const rect = container.getBoundingClientRect();
          mouse.current = { x: clientX - rect.left, y: clientY - rect.top };
          return;
        }
        mouse.current = { x: clientX, y: clientY };
      };

      const onMouseMove = (e: MouseEvent) => track(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (touch) track(touch.clientX, touch.clientY);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("touchmove", onTouchMove);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("touchmove", onTouchMove);
      };
    }, [containerRef]);

    const update = useCallback(() => {
      const container = containerRef.current;
      if (!container) return;

      const { x, y } = mouse.current;
      // Nothing moved, so every character still holds its last value.
      if (lastMouse.current.x === x && lastMouse.current.y === y) return;
      lastMouse.current = { x, y };

      const containerRect = container.getBoundingClientRect();

      charRefs.current.forEach((char) => {
        if (!char) return;
        const rect = char.getBoundingClientRect();
        const distance = Math.hypot(
          rect.left + rect.width / 2 - containerRect.left - x,
          rect.top + rect.height / 2 - containerRect.top - y
        );

        if (distance >= radius) {
          char.style.fontVariationSettings = fromFontVariationSettings;
          return;
        }

        const t = falloffAt(distance, radius, falloff);
        char.style.fontVariationSettings = axes
          .map(({ axis, fromValue, toValue }) => `'${axis}' ${fromValue + (toValue - fromValue) * t}`)
          .join(", ");
      });
    }, [axes, containerRef, falloff, fromFontVariationSettings, radius]);

    useEffect(() => {
      let frame = requestAnimationFrame(function loop() {
        update();
        frame = requestAnimationFrame(loop);
      });
      return () => cancelAnimationFrame(frame);
    }, [update]);

    const words = label.split(" ");
    let charIndex = 0;

    return (
      <span ref={ref} className={cn(className)} onClick={onClick} style={{ display: "inline", ...style }}>
        {words.map((word, wordIndex) => (
          <span key={`${word}-${wordIndex}`} style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.split("").map((char) => {
              const index = charIndex++;
              return (
                <span
                  key={index}
                  ref={(el) => {
                    charRefs.current[index] = el;
                  }}
                  data-vp-char=""
                  aria-hidden="true"
                  style={{ display: "inline-block" }}
                >
                  {char}
                </span>
              );
            })}
            {wordIndex < words.length - 1 && <span style={{ display: "inline-block" }}>&nbsp;</span>}
          </span>
        ))}
        <span className="sr-only">{label}</span>
      </span>
    );
  }
);
