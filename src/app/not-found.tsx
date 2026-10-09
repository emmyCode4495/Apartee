import Link from "next/link";
import { LogoMark } from "@/components/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-lg flex-col items-center px-4 py-24 text-center">
      <LogoMark className="size-14" />
      <h1 className="mt-6 text-3xl font-semibold">We can&apos;t find that page</h1>
      <p className="mt-3 text-muted">
        The link may be out of date, or the apartment is no longer listed.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/listings?type=apartment"
          className="inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white transition hover:bg-primary-hover"
        >
          Browse apartments
        </Link>
        <Link
          href="/"
          className="inline-flex h-11 items-center rounded-xl border border-border bg-card px-6 text-sm font-semibold transition hover:border-foreground"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
