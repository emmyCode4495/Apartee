import Link from "next/link";
import Logo from "@/components/Logo";

const COLUMNS = [
  {
    title: "Explore",
    links: [
      { href: "/listings?type=apartment", label: "Apartments" },
      { href: "/listings", label: "All stays" },
      { href: "/saved", label: "Saved stays" },
    ],
  },
  {
    title: "Support",
    links: [
      { href: "#", label: "Help center" },
      { href: "#", label: "Cancellation options" },
      { href: "#", label: "Contact us" },
    ],
  },
  {
    title: "Hosting",
    links: [
      { href: "#", label: "List your apartment" },
      { href: "#", label: "Host resources" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-foreground text-white/70">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <div className="[&_span]:text-white">
              <Logo />
            </div>
            <p className="mt-4 text-sm leading-relaxed">
              Verified, furnished apartments with the full price shown before
              you book.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-sm font-semibold text-white">
                {col.title}
              </h3>
              <ul className="space-y-2.5 text-sm">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link href={l.href} className="transition hover:text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Apartee. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition hover:text-white">Privacy</a>
            <a href="#" className="transition hover:text-white">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
