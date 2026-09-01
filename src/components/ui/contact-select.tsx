"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";

type Option = { value: string; label: string };

export function ContactSelect({
  id,
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative border-t border-brand-10/10">
      <button
        type="button"
        id={id}
        data-event="hover"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-20 max-h-[10vh] w-full cursor-pointer flex-col justify-start px-c-16 py-3 text-left"
      >
        <span className="body-xs pointer-events-none flex items-center gap-1.5">{label}</span>
        <span
          className={cn(
            "body-md pointer-events-none pt-1",
            selected ? "text-brand-05" : "text-brand-05/40"
          )}
        >
          {selected?.label ?? placeholder}
        </span>
        <svg
          className={cn(
            "pointer-events-none absolute top-1/2 right-c-16 -translate-y-1/2 transition-transform duration-300",
            open && "rotate-180"
          )}
          width="12"
          height="8"
          viewBox="0 0 12 8"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M1 1.5L6 6.5L11 1.5"
            stroke="white"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-labelledby={id}
          className="absolute top-full right-0 left-0 z-20 max-h-60 overflow-auto border-t border-brand-10/10 bg-brand-100/90 backdrop-blur-xl"
        >
          {options.map((option) => (
            <li key={option.value} role="presentation">
              <button
                type="button"
                role="option"
                aria-selected={option.value === value}
                className="body-md w-full px-c-16 py-3 text-left hover:bg-brand-05/5"
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                }}
              >
                {option.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
