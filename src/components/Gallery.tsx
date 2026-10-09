"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, LayoutGrid, X } from "lucide-react";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
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
    lastFocus.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
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
          <Image src={images[0]} alt={title} fill priority className="object-cover transition duration-500 hover:scale-[1.02]" sizes="50vw" />
        </button>
        {tiles.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => show(i + 1)}
            aria-label={`Open photo ${i + 2}`}
            className="relative overflow-hidden bg-surface"
          >
            <Image src={img} alt={`${title}, photo ${i + 2}`} fill className="object-cover transition duration-500 hover:scale-[1.04]" sizes="25vw" />
          </button>
        ))}
        {count > 1 && (
          <button
            type="button"
            onClick={() => show(0)}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-lg bg-white px-3.5 py-2 text-sm font-semibold shadow transition hover:scale-[1.02]"
          >
            <LayoutGrid className="size-4" aria-hidden />
            Show all {count} photos
          </button>
        )}
      </div>

      {/* Mobile swipe gallery */}
      <div className="relative -mx-4 sm:hidden">
        <div
          className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
          onScroll={(e) => {
            const el = e.currentTarget;
            setMobileIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
        >
          {images.map((img, i) => (
            <button
              key={img}
              type="button"
              onClick={() => show(i)}
              aria-label={`Open photo ${i + 1}`}
              className="relative aspect-[4/3] w-full shrink-0 snap-center bg-surface"
            >
              <Image src={img} alt={i === 0 ? title : `${title}, photo ${i + 1}`} fill priority={i === 0} className="object-cover" sizes="100vw" />
            </button>
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-foreground/75 px-2.5 py-1 text-xs font-semibold text-white tabular">
          {mobileIndex + 1} / {count}
        </span>
      </div>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${title}, photos`}
          className="fixed inset-0 z-[70] flex flex-col bg-foreground text-white"
        >
          <div className="flex items-center justify-between px-4 py-3 sm:px-6">
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close photos"
              className="flex size-10 items-center justify-center rounded-full transition hover:bg-white/10"
            >
              <X className="size-5" />
            </button>
            <p className="text-sm font-medium tabular" aria-live="polite">
              {index + 1} / {count}
            </p>
            <span className="size-10" />
          </div>

          <div className="relative min-h-0 flex-1">
            <Image
              key={images[index]}
              src={images[index]}
              alt={`${title}, photo ${index + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
            />
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous photo"
                  onClick={() => setIndex((i) => (i - 1 + count) % count)}
                  className="absolute left-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 sm:left-6"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  aria-label="Next photo"
                  onClick={() => setIndex((i) => (i + 1) % count)}
                  className="absolute right-3 top-1/2 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 backdrop-blur transition hover:bg-white/25 sm:right-6"
                >
                  <ChevronRight className="size-5" />
                </button>
              </>
            )}
          </div>

          <div className="no-scrollbar flex gap-2 overflow-x-auto px-4 py-4 sm:justify-center sm:px-6">
            {images.map((img, i) => (
              <button
                key={img}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-md transition ${
                  i === index ? "ring-2 ring-lit" : "opacity-55 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="" fill className="object-cover" sizes="80px" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
