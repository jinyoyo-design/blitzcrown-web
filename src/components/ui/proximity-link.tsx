"use client";

import Link from "next/link";
import { useRef } from "react";
import { VariableProximity } from "./variable-proximity";

// Header and menu labels share one proximity treatment: Barlow weight ramps
// weight axis ramps 400 -> 900 within 80px of the cursor.
const PROXIMITY = {
  fromFontVariationSettings: "'wght' 400",
  toFontVariationSettings: "'wght' 900",
  radius: 80,
  falloff: "exponential",
} as const;

type ProximityLabelProps = { label: string; className?: string };

export function ProximityLabel({ label, className }: ProximityLabelProps) {
  const containerRef = useRef<HTMLSpanElement>(null);

  return (
    <span ref={containerRef} data-proximity-text className="inline">
      <VariableProximity label={label} containerRef={containerRef} className={className} {...PROXIMITY} />
    </span>
  );
}

type ProximityLinkProps = {
  href: string;
  label: string;
  className?: string;
  /** `simple-hover` shrinks the cursor crosshair; `hover` also shows the ring. */
  event?: "hover" | "simple-hover";
};

export function ProximityLink({ href, label, className, event = "simple-hover" }: ProximityLinkProps) {
  return (
    <Link href={href} data-event={event} className={className}>
      <ProximityLabel label={label} />
    </Link>
  );
}
