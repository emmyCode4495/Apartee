import Link from "next/link";
import Image from "next/image";

export default function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12 sm:py-16">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="mb-6 inline-flex justify-center"
            aria-label="Apatmentz home — Find Your Perfect Stay"
          >
            <Image
              src="/apatmentz-logo.png"
              alt="Apatmentz — Find Your Perfect Stay"
              width={1983}
              height={793}
              priority
              className="h-12 w-auto max-w-[14rem] object-contain object-center sm:h-14 sm:max-w-[16rem]"
              sizes="256px"
            />
          </Link>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-sm text-muted sm:text-base">{subtitle}</p>
          )}
        </div>

        <div className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
          {children}
        </div>

        {footer && (
          <div className="mt-6 text-center text-sm text-muted">{footer}</div>
        )}
      </div>
    </div>
  );
}