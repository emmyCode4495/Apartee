import Link from "next/link";
import Image from "next/image";
import type { Property } from "@/data/properties";
import Price from "@/components/Price";

/**
 * A building facade built from real listings: each window is an apartment.
 * The top-rated unit has its light on.
 */
export default function Facade({ properties }: { properties: Property[] }) {
  const units = properties.slice(0, 6);
  const topRated = units.reduce(
    (best, p) => (p.rating > best.rating ? p : best),
    units[0]
  );

  return (
    <div className="rounded-2xl bg-foreground p-3 shadow-lift">
      <ul className="grid grid-cols-3 gap-2.5">
        {units.map((p, i) => {
          const lit = p.id === topRated?.id;
          return (
            <li key={p.id}>
              <Link
                href={`/property/${p.id}`}
                className={`group relative block aspect-[3/4] overflow-hidden rounded-md ${
                  lit ? "ring-2 ring-lit ring-offset-2 ring-offset-foreground" : ""
                }`}
                aria-label={`${p.title}, ${p.location}`}
              >
                <Image
                  src={p.images[0]}
                  alt=""
                  fill
                  priority={i < 3}
                  className="img-zoom object-cover"
                  sizes="(max-width: 1024px) 0px, 180px"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-transparent to-transparent" aria-hidden />
                {lit && (
                  <span className="absolute left-2 top-2 flex items-center gap-1.5 rounded-full bg-lit px-2 py-0.5 text-[11px] font-semibold text-foreground">
                    Top rated
                  </span>
                )}
                <span className="absolute inset-x-2 bottom-2 text-xs font-semibold text-white">
                  <Price usd={p.pricePerNight} compact />
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
