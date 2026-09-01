"use client";

import { motion, useMotionValue, animate, type AnimationPlaybackControls } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

export type DraggableGridItem = {
  image?: { src?: string; srcSet?: string; alt?: string };
  alt?: string;
  slug?: string;
};

export type DraggableGridProps = {
  items: DraggableGridItem[];
  columns?: number;
  imageWidth?: number;
  imageHeight?: number;
  rounded?: number;
  gap?: number;
  enableWheel?: boolean;
  placeholderColor?: string;
  onItemClick?: (item: DraggableGridItem, index: number) => void;
  style?: React.CSSProperties;
  className?: string;
};

const DEFAULTS = {
  columns: 17,
  imageWidth: 386,
  imageHeight: 516,
  rounded: 2,
  gap: 3,
  enableWheel: true,
  placeholderColor: "#1a1a1f",
} as const;

function getItemColor(index: number) {
  const hue = (index * 137.508) % 360;
  return `hsl(${hue}, 55%, 55%)`;
}

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function fillAndShuffle<T>(items: T[], target: number, seed: number): T[] {
  if (items.length === 0) return [];
  const rand = mulberry32(seed);
  const out: T[] = [];
  const refill = () => {
    const pool = items.slice();
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool;
  };
  let pool = refill();
  while (out.length < target) {
    if (pool.length === 0) pool = refill();
    const next = pool.pop()!;
    if (out.length > 0 && next === out[out.length - 1] && pool.length > 0) {
      const swap = pool.pop()!;
      out.push(swap);
      pool.push(next);
    } else {
      out.push(next);
    }
  }
  return out;
}

export function DraggableGrid(props: DraggableGridProps) {
  const {
    items,
    columns = DEFAULTS.columns,
    imageWidth = DEFAULTS.imageWidth,
    imageHeight = DEFAULTS.imageHeight,
    rounded = DEFAULTS.rounded,
    gap = DEFAULTS.gap,
    enableWheel = DEFAULTS.enableWheel,
    onItemClick,
    style,
    className,
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const [containerSize, setContainerSize] = useState({ w: 800, h: 600 });
  const [isDragging, setIsDragging] = useState(false);
  const initializedRef = useRef(false);

  const pointerDownPos = useRef<{ x: number; y: number; t: number } | null>(null);
  const wheelAnimX = useRef<AnimationPlaybackControls | null>(null);
  const wheelAnimY = useRef<AnimationPlaybackControls | null>(null);
  const failedImages = useRef<Set<number>>(new Set());
  const [, forceRender] = useState(0);

  const safeItems = Array.isArray(items) && items.length > 0 ? items : [];
  const safeColumns = Math.max(1, Math.min(20, Math.floor(columns)));
  const safeImageWidth = Math.max(20, Math.min(4000, imageWidth));
  const safeImageHeight = Math.max(20, Math.min(4000, imageHeight));
  const safeGap = Math.max(0, Math.min(100, gap)) * 4;
  const r = Math.max(0, Math.min(20, rounded));
  const radius = (r / 20) * (Math.min(safeImageWidth, safeImageHeight) / 2);

  const rows = safeColumns;
  const totalCells = safeColumns * rows;
  const displayItems = useMemo(
    () => fillAndShuffle(safeItems, totalCells, 0xc0ffee),
    [safeItems, totalCells]
  );

  const gridW = safeColumns * safeImageWidth + (safeColumns - 1) * safeGap;
  const gridH = rows * safeImageHeight + (rows - 1) * safeGap;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const measure = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setContainerSize({ w: rect.width, h: rect.height });
      }
    };
    measure();

    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const maxX = safeGap;
  const minX = Math.min(maxX, containerSize.w - gridW - safeGap);
  const maxY = safeGap;
  const minY = Math.min(maxY, containerSize.h - gridH - safeGap);

  const dragConstraints = {
    left: minX,
    right: maxX,
    top: minY,
    bottom: maxY,
  };

  useEffect(() => {
    if (initializedRef.current) return;
    if (containerSize.w === 0 || containerSize.h === 0) return;

    x.set(maxX);
    y.set(maxY);
    initializedRef.current = true;
  }, [containerSize.w, containerSize.h, maxX, maxY, x, y]);

  useEffect(() => {
    if (!enableWheel) return;
    const el = containerRef.current;
    if (!el) return;

    const clamp = (v: number, mn: number, mx: number) => Math.min(Math.max(v, mn), mx);

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const curX = x.get();
      const curY = y.get();
      const targetX = clamp(curX - e.deltaX, minX, maxX);
      const targetY = clamp(curY - e.deltaY, minY, maxY);
      wheelAnimX.current?.stop();
      wheelAnimY.current?.stop();
      wheelAnimX.current = animate(x, targetX, {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      });
      wheelAnimY.current = animate(y, targetY, {
        duration: 0.3,
        ease: [0.22, 1, 0.36, 1],
      });
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      wheelAnimX.current?.stop();
      wheelAnimY.current?.stop();
    };
  }, [enableWheel, minX, maxX, minY, maxY, x, y]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    pointerDownPos.current = { x: e.clientX, y: e.clientY, t: Date.now() };
  }, []);

  const handlePointerUp = useCallback(
    (e: React.PointerEvent, item: DraggableGridItem, index: number) => {
      const start = pointerDownPos.current;
      pointerDownPos.current = null;
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      if (Math.hypot(dx, dy) < 5) {
        onItemClick?.(item, index);
      }
    },
    [onItemClick]
  );

  const handleImageError = useCallback((index: number) => {
    failedImages.current.add(index);
    forceRender((n) => n + 1);
  }, []);

  if (safeItems.length === 0) return null;

  return (
    <div
      ref={containerRef}
      className={className}
      data-lenis-prevent
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minWidth: 0,
        minHeight: 480,
        margin: 0,
        boxSizing: "border-box",
        overflow: "hidden",
        touchAction: "none",
        userSelect: "none",
        cursor: isDragging ? "grabbing" : "grab",
        ...style,
      }}
    >
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: gridW,
          height: gridH,
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: `repeat(${safeColumns}, ${safeImageWidth}px)`,
          gridAutoRows: `${safeImageHeight}px`,
          gap: `${safeGap}px`,
          willChange: "transform",
          x,
          y,
        }}
        drag
        dragConstraints={dragConstraints}
        dragElastic={0}
        dragMomentum
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
      >
        {displayItems.map((item, index) => {
          const src = item?.image?.src;
          const alt = item?.alt ?? item?.image?.alt ?? "";
          const failed = failedImages.current.has(index);
          return (
            <div
              key={index}
              onPointerDown={handlePointerDown}
              onPointerUp={(e) => handlePointerUp(e, item, index)}
              style={{
                position: "relative",
                width: safeImageWidth,
                height: safeImageHeight,
                overflow: "hidden",
                borderRadius: radius,
                backgroundColor: getItemColor(index),
                cursor: isDragging ? "grabbing" : "pointer",
              }}
            >
              {src && !failed ? (
                <img
                  src={src}
                  alt={alt}
                  draggable={false}
                  onError={() => handleImageError(index)}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    pointerEvents: "none",
                    userSelect: "none",
                    display: "block",
                  }}
                />
              ) : null}
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
