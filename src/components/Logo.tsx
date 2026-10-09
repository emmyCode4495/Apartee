import Link from "next/link";

/** Apartee mark: a block of windows with one lit. */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="8" fill="#0e1726" />
      <rect x="7" y="7" width="8" height="8" rx="1.5" fill="#fff" fillOpacity=".92" />
      <rect x="17" y="7" width="8" height="8" rx="1.5" fill="#fff" fillOpacity=".3" />
      <rect x="7" y="17" width="8" height="8" rx="1.5" fill="#fff" fillOpacity=".3" />
      <rect x="17" y="17" width="8" height="8" rx="1.5" fill="#ffb020" />
    </svg>
  );
}

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="Apartee home"
      className={`inline-flex items-center gap-2.5 ${className}`}
    >
      <LogoMark />
      <span className="font-display text-xl font-semibold tracking-tight text-foreground">
        Apartee
      </span>
    </Link>
  );
}
