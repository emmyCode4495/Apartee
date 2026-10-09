import Link from "next/link";
import Image from "next/image";

export function LogoMark({ className = "size-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className={className}
      aria-hidden
      fill="none"
    >
      <defs>
        <linearGradient
          id="apatmentz-a"
          x1="4"
          y1="4"
          x2="44"
          y2="44"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00a388" />
          <stop offset="1" stopColor="#006b5a" />
        </linearGradient>
      </defs>
      <path
        d="M24 4C22.5 4 21.2 4.8 20.4 6.1L6.8 32.2c-.9 1.7.3 3.8 2.2 3.8h6.4c1 0 1.9-.5 2.4-1.4L24 20.5l6.2 14.1c.5.9 1.4 1.4 2.4 1.4h6.4c1.9 0 3.1-2.1 2.2-3.8L27.6 6.1C26.8 4.8 25.5 4 24 4z"
        fill="url(#apatmentz-a)"
      />
      <path
        d="M8 38.5c5.5 2.2 11.5 3.3 16 3.3s10.5-1.1 16-3.3"
        stroke="url(#apatmentz-a)"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M24 14.5l-7.5 9.5h2.2v7.2h10.6v-7.2h2.2L24 14.5z"
        fill="#ffffff"
      />
      <rect x="19.2" y="21.2" width="3.2" height="3.2" rx="0.4" fill="#f5a623" />
      <rect x="25.6" y="21.2" width="3.2" height="3.2" rx="0.4" fill="#f5a623" />
      <rect x="19.2" y="26.2" width="3.2" height="3.2" rx="0.4" fill="#f5a623" />
      <rect x="25.6" y="26.2" width="3.2" height="3.2" rx="0.4" fill="#f5a623" />
    </svg>
  );
}

type LogoProps = {
  className?: string;
  variant?: "full" | "mark" | "responsive";
  priority?: boolean;
};

export default function Logo({
  className = "",
  variant = "responsive",
  priority = false,
}: LogoProps) {
  if (variant === "mark") {
    return (
      <Link
        href="/"
        aria-label="Apatmentz home"
        className={`inline-flex shrink-0 items-center ${className}`}
      >
        <LogoMark className="size-9" />
      </Link>
    );
  }

  if (variant === "full") {
    return (
      <Link
        href="/"
        aria-label="Apatmentz home — Find Your Perfect Stay"
        className={`inline-flex shrink-0 items-center ${className}`}
      >
        <Image
          src="/apatmentz-logo.png"
          alt="Apatmentz — Find Your Perfect Stay"
          width={1983}
          height={793}
          priority={priority}
          className="h-9 w-auto max-w-[11rem] object-contain object-left sm:max-w-[13rem]"
          sizes="200px"
        />
      </Link>
    );
  }

  // responsive: compact mark on small screens (avoids covering hamburger on real phones)
  return (
    <Link
      href="/"
      aria-label="Apatmentz home — Find Your Perfect Stay"
      className={`inline-flex shrink-0 items-center ${className}`}
    >
      <span className="md:hidden">
        <LogoMark className="size-9" />
      </span>
      <Image
        src="/apatmentz-logo.png"
        alt="Apatmentz — Find Your Perfect Stay"
        width={1983}
        height={793}
        priority={priority}
        className="hidden h-9 w-auto max-w-[13rem] object-contain object-left md:block"
        sizes="200px"
      />
    </Link>
  );
}
