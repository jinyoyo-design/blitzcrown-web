"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BrandLogo } from "@/components/ui/brand-logo";
import { FOOTER } from "@/config/site";
import { scrollToNavTarget } from "@/lib/nav-scroll";
import { useScrollStore } from "@/stores/scroll-store";

type FooterLink = {
  label: string;
  href?: string;
  external?: boolean;
};

function FooterNavLink({
  link,
  onAnchorClick,
}: {
  link: FooterLink;
  onAnchorClick: (event: React.MouseEvent<HTMLAnchorElement>, href: string) => void;
}) {
  const className =
    "body-sm text-brand-05/85 transition-colors duration-300 hover:text-brand-50 w-fit";

  if (!link.href) {
    return <span className="body-sm text-brand-05/85">{link.label}</span>;
  }
  if (link.external && link.href) {
    return (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        data-event="hover"
        className={className}
      >
        {link.label}
      </a>
    );
  }

  if (link.href.startsWith("mailto:")) {
    return (
      <a href={link.href} data-event="hover" className={className}>
        {link.label}
      </a>
    );
  }

  return (
    <Link
      href={link.href}
      data-event="hover"
      className={className}
      onClick={(event) => onAnchorClick(event, link.href!)}
    >
      {link.label}
    </Link>
  );
}

export function Footer() {
  const pathname = usePathname();
  const lenis = useScrollStore((s) => s.lenis);

  const onAnchorClick = (event: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!href.startsWith("/#") || pathname !== "/") return;
    event.preventDefault();
    scrollToNavTarget(lenis, href.slice(1));
    window.history.replaceState(null, "", href);
  };

  return (
    <footer className="relative z-10 px-8 pt-c-120 pb-c-48 tablet-portrait:px-12 desktop:px-24">
      <div className="tablet-portrait:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] desktop:grid-cols-[minmax(0,1fr)_auto] grid gap-c-48">
        <div className="max-w-120 flex flex-col gap-c-16">
          <BrandLogo
            onClick={(event) => onAnchorClick(event, "/#home")}
            imageClassName="h-8 max-w-[260px] tablet-portrait:h-9 tablet-portrait:max-w-[280px]"
          />
          <p className="body-sm text-brand-05/70 max-w-100 leading-[1.65em]">{FOOTER.tagline}</p>
        </div>

        <div className="tablet-portrait:grid-cols-3 grid gap-c-32 gap-y-c-24">
          {FOOTER.columns.map((column) => (
            <div key={column.title} className="flex flex-col gap-c-16">
              <p className="body-xs text-brand-50 font-barlow font-semibold tracking-[0.18em] uppercase">
                {column.title}
              </p>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <FooterNavLink link={link} onAnchorClick={onAnchorClick} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-brand-05/10 mt-c-48 mb-c-32 border-t" />

      <div className="tablet-portrait:flex-row tablet-portrait:items-end tablet-portrait:justify-between flex flex-col gap-c-24">
        <div className="max-w-160 flex flex-col gap-2">
          <p className="body-xs text-brand-05/55">{FOOTER.copyright}</p>
          <p className="body-xs text-brand-05/40 max-w-140 leading-[1.65em]">{FOOTER.disclaimer}</p>
        </div>
        <p className="body-xs text-brand-05/55 tablet-portrait:text-right shrink-0">{FOOTER.badges}</p>
      </div>
    </footer>
  );
}
