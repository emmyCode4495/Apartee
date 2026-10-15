"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LayoutGrid, X } from "lucide-react";

export default function Gallery({
  images,
  title,
}: {
  images: string[];
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [mobileIndex, setMobileIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const lastFocus = useRef<HTMLElement | null>(null);

  const count = images.length;

  function show(i: number) {
    lastFocus.current = document.activeElement as HTMLElement;
    setIndex(i);
    setOpen(true);
  }

  function close() {
    setOpen(false);
    // restore focus after paint
    requestAnimationFrame(() => lastFocus.current?.focus());
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
      }
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % count);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + count) % count);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, count]);

  const full = count >= 5;
  const tiles = full ? images.slice(1, 5) : images.slice(1, 2);

  return (
    <>
      {/* Desktop grid */}
      <div
        className={`relative hidden h-[26rem] gap-2 overflow-hidden rounded-2xl sm:grid lg:h-[30rem] ${
          full ? "grid-cols-4 grid-rows-2" : "grid-cols-2"
        }`}
      >
        <button
          type="button"
          onClick={() => show(0)}
          aria-label="Open photo 1"
          className={`relative overflow-hidden bg-surface ${full ? "col-span-2 row-span-2" : ""}`}
        >
          <Image
            unoptimized
            src={images[0]}
            alt={title}
            fill
            priority
            className="object-cover transition duration-500 hover:scale-[1.02]"
            sizes="50vw"
          />
        </button>
        {tiles.map((img, i) => (
          <button
            key={img + i}
            type="button"
            onClick={() => show(i + 1)}
            aria-label={`Open photo ${i + 2}`}
            className="relative overflow-hidden bg-surface"
          >
            <Image
              unoptimized
              src={img}
              alt={`${title}, photo ${i + 2}`}
              fill
              className="object-cover transition duration-500 hover:scale-[1.04]"
              sizes="25vw"
            />
          </button>
        ))}
        <button
          type="button"
          onClick={() => show(0)}
          className="absolute bottom-3 right-3 z-10 inline-flex items-center gap-2 rounded-xl bg-card px-3 py-2 text-sm font-semibold text-foreground shadow-lift"
        >
          <LayoutGrid className="size-4" />
          Show all photos
        </button>
      </div>

      {/* Mobile strip */}
      <div className="relative sm:hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-2xl"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => show(i)}
              className="relative aspect-[4/3] w-full shrink-0 snap-center bg-surface"
              aria-label={`Open photo ${i + 1}`}
            >
              <Image
                unoptimized
                src={img}
                alt={i === 0 ? title : `${title}, photo ${i + 1}`}
                fill
                priority={i === 0}
                className="object-cover"
                sizes="100vw"
              />
            </button>
          ))}
        </div>
        {count > 1 && (
          <p className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-medium text-white tabular">
            {mobileIndex + 1} / {count}
          </p>
        )}
      </div>

      {/* Fullscreen lightbox — above navbar (z-100) and chat (z-150) */}
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, photos`}
          className="fixed inset-0 z-[200] flex flex-col bg-black text-white"
        >
          {/* Sticky close bar — always reachable */}
          <div className="safe-top flex shrink-0 items-center justify-between gap-3 border-b border-white/10 bg-black/90 px-3 py-3 backdrop-blur sm:px-6">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close photos"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-white/15 px-4 text-sm font-semibold transition hover:bg-white/25 active:bg-white/30"
            >
              <X className="size-5" />
              Close
            </button>
            <p className="text-sm font-medium tabular" aria-live="polite">
              {index + 1} / {count}
            </p>
            {/* Extra close on the right for thumb reach */}
            <button
              type="button"
              onClick={close}
              aria-label="Close photos"
              className="flex size-11 items-center justify-center rounded-full bg-white/15 transition hover:bg-white/25"
            >
              <X className="size-5" />
            </button>
          </div>

          {/* Image area: click empty space to close */}
          <div
            className="relative min-h-0 flex-1 cursor-zoom-out"
            onClick={close}
            role="presentation"
          >
            <div
              className="absolute inset-0"
              onClick={(e) => e.stopPropagation()}
              role="presentation"
            >
              <Image
                unoptimized
                key={images[index]}
                src={images[index]}
                alt={`${title}, photo ${index + 1}`}
                fill
                className="object-contain p-2 sm:p-4"
                sizes="100vw"
                priority
              />
            </div>
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i - 1 + count) % count);
                  }}
                  className="absolute left-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30 sm:left-6"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i + 1) % count);
                  }}
                  className="absolute right-2 top-1/2 z-10 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/20 backdrop-blur transition hover:bg-white/30 sm:right-6"
                >
                  <ChevronRight className="size-6" />
                </button>
              </>
            )}
          </div>

          <div className="no-scrollbar flex shrink-0 gap-2 overflow-x-auto border-t border-white/10 bg-black/90 px-4 py-4 sm:justify-center sm:px-6">
            {images.map((img, i) => (
              <button
                key={img + i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition ${
                  i === index ? "ring-2 ring-white" : "opacity-55 hover:opacity-100"
                }`}
              >
                <Image
                  unoptimized
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
