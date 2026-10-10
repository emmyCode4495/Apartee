"use client";

type Props = {
  src: string;
  alt?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fill?: boolean;
};

/**
 * Native <img> for remote URLs (e.g. Supabase Storage).
 * Avoids Next.js image optimizer issues with external hosts.
 */
export default function SafeImage({
  src,
  alt = "",
  className = "",
  priority,
  fill,
}: Props) {
  if (!src) return null;

  if (fill) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover ${className}`}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        referrerPolicy="no-referrer"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
}