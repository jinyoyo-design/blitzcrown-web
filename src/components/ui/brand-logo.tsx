import Link from "next/link";
import { cn } from "@/lib/cn";

export const BRAND_LOGO_SRC = "/logo/group-5.png";

type BrandLogoProps = {
  href?: string;
  className?: string;
  imageClassName?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
};

export function BrandLogo({
  href = "/#home",
  className,
  imageClassName,
  onClick,
}: BrandLogoProps) {
  return (
    <Link
      href={href}
      data-event="hover"
      onClick={onClick}
      className={cn("inline-flex shrink-0 items-center leading-none", className)}
    >
      <img
        src={BRAND_LOGO_SRC}
        alt="Blitzcrown"
        draggable={false}
        className={cn(
          "block h-7 w-auto max-w-[min(42vw,220px)] object-contain object-left tablet-portrait:h-8 tablet-portrait:max-w-[240px]",
          imageClassName,
        )}
      />
    </Link>
  );
}
