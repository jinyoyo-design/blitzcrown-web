"use client";

import Link from "next/link";
import { LumenCta } from "@/shaders/lumen-cta/LumenCta";
import { cn } from "@/lib/cn";

const LUMEN_GHOST = {
  variant: "ghost" as const,
  mode: "dark" as const,
  hue: 0,
  saturation: 1,
  brightness: 1,
  ring: false,
};

type LumenShellProps = {
  mode?: "light" | "dark";
  wrapperClassName?: string;
  compact?: boolean;
  className?: string;
  children: React.ReactNode;
};

function lumenShellClassName({
  mode = "dark",
  wrapperClassName,
  compact,
}: Pick<LumenShellProps, "mode" | "wrapperClassName" | "compact">) {
  return cn(
    "lumen-cta--inline",
    compact && "lumen-cta--compact",
    wrapperClassName
  );
}

export type GlassButtonProps = React.ComponentPropsWithoutRef<"button"> & {
  mode?: "light" | "dark";
  wrapperClassName?: string;
  compact?: boolean;
};

/** ThreeUI Lumen CTA Ghost (`lumen-cta-ghost`) rectangle button for in-page CTAs. */
export function GlassButton({
  mode = "dark",
  className,
  wrapperClassName,
  compact = false,
  children,
  type = "button",
  ...props
}: GlassButtonProps) {
  return (
    <LumenCta
      {...LUMEN_GHOST}
      mode={mode}
      type={type}
      className={lumenShellClassName({ mode, wrapperClassName, compact })}
      buttonClassName={className}
      data-event="hover"
      {...props}
    >
      {children}
    </LumenCta>
  );
}

export type GlassButtonLinkProps = Omit<React.ComponentPropsWithoutRef<typeof Link>, "children"> & {
  mode?: "light" | "dark";
  className?: string;
  wrapperClassName?: string;
  compact?: boolean;
  children: React.ReactNode;
};

export function GlassButtonLink({
  mode = "dark",
  className,
  wrapperClassName,
  compact = false,
  children,
  ...props
}: GlassButtonLinkProps) {
  return (
    <div
      className={cn("lumen-cta", `lumen-cta--${mode}`, lumenShellClassName({ mode, wrapperClassName, compact }))}
      data-variant="ghost"
      style={
        {
          "--lumen-cta-hue": "0deg",
          "--lumen-cta-saturation": 1,
          "--lumen-cta-brightness": 1,
        } as React.CSSProperties
      }
    >
      <Link
        data-event="hover"
        className={cn("lumen-cta__button lumen-cta__button--ghost", className)}
        {...props}
      >
        {children}
      </Link>
    </div>
  );
}

type GlassButtonVisualProps = LumenShellProps;

/** Non-interactive shell for cases that need the same visual without a native control. */
export function GlassButtonVisual({
  mode = "dark",
  className,
  wrapperClassName,
  compact = false,
  children,
}: GlassButtonVisualProps) {
  return (
    <div
      className={cn("lumen-cta", `lumen-cta--${mode}`, lumenShellClassName({ mode, wrapperClassName, compact }))}
      data-variant="ghost"
    >
      <span className={cn("lumen-cta__button lumen-cta__button--ghost", className)} aria-hidden="true">
        {children}
      </span>
    </div>
  );
}
