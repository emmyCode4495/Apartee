import type { AvailabilityStatus } from "@/lib/types";

function formatDate(iso: string) {
  try {
    return new Date(iso + "T12:00:00").toLocaleDateString(undefined, {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AvailabilityBadge({
  status = "available",
  availableFrom,
  className = "",
}: {
  status?: AvailabilityStatus;
  availableFrom?: string | null;
  className?: string;
}) {
  if (status === "booked") {
    return (
      <div className={className}>
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900 dark:bg-amber-950 dark:text-amber-200">
          Booked
        </span>
        {availableFrom && (
          <p className="mt-1 text-xs text-muted">
            Free from {formatDate(availableFrom)}
          </p>
        )}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 ${className}`}
    >
      Available
    </span>
  );
}
