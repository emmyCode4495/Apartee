/** Tiny line-drawn floor plans, one per bedroom count. Decorative. */
export default function FloorPlan({
  bedrooms,
  className = "h-16 w-24",
}: {
  bedrooms: 1 | 2 | 3;
  className?: string;
}) {
  const wall = { stroke: "currentColor", strokeWidth: 2.5, fill: "none", strokeLinecap: "square" as const };
  const door = { stroke: "currentColor", strokeWidth: 1.5, fill: "none", opacity: 0.45 };
  return (
    <svg viewBox="0 0 96 64" className={className} aria-hidden>
      <rect x="3" y="3" width="90" height="58" {...wall} />
      {bedrooms === 1 && (
        <>
          <path d="M46 3v34M46 37h47" {...wall} />
          <path d="M46 24a10 10 0 0 0 -10 10" {...door} />
          <rect x="8" y="9" width="26" height="18" rx="2" {...door} />
        </>
      )}
      {bedrooms === 2 && (
        <>
          <path d="M34 3v34M34 37h59M64 37v24" {...wall} />
          <path d="M34 22a10 10 0 0 0 -10 10M64 48a10 10 0 0 1 10 10" {...door} />
          <rect x="8" y="9" width="20" height="15" rx="2" {...door} />
          <rect x="68" y="42" width="20" height="14" rx="2" {...door} />
        </>
      )}
      {bedrooms === 3 && (
        <>
          <path d="M28 3v30M28 33h65M56 3v30M56 33v28M76 33v28" {...wall} />
          <path d="M28 20a8 8 0 0 0 -8 8M56 20a8 8 0 0 0 -8 8M76 52a8 8 0 0 1 8 8" {...door} />
        </>
      )}
    </svg>
  );
}
