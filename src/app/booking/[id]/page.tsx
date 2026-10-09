import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Check } from "lucide-react";
import { getPropertyById } from "@/lib/data";
import BookingSection from "@/components/BookingSection";
import BookingSummary from "@/components/BookingSummary";
import { nightsBetween } from "@/lib/dates";

export const metadata = { title: "Review and pay" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
}

export default async function BookingPage({ params, searchParams }: PageProps) {
  const { id } = await params;
  const sp = await searchParams;
  const property = await getPropertyById(id);

  if (!property) notFound();

  const checkIn = sp.checkIn ?? "";
  const checkOut = sp.checkOut ?? "";
  const guests = sp.guests ? Number(sp.guests) : 2;
  const datesChosen = !!checkIn && !!checkOut && nightsBetween(checkIn, checkOut) > 0;
  const nights = Math.max(1, nightsBetween(checkIn, checkOut));
  const subtotal = nights * property.pricePerNight;
  const cleaningFee = 75;
  const serviceFee = Math.round(subtotal * 0.12);
  const total = subtotal + cleaningFee + serviceFee;

  const back = new URLSearchParams();
  if (checkIn) back.set("checkIn", checkIn);
  if (checkOut) back.set("checkOut", checkOut);
  back.set("guests", String(guests));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href={`/property/${id}?${back.toString()}`}
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-muted transition hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden />
        Back to listing
      </Link>

      <ol className="mb-8 flex items-center gap-3 text-sm" aria-label="Booking progress">
        <li className="flex items-center gap-2 text-muted">
          <span className="flex size-6 items-center justify-center rounded-full bg-success text-white">
            <Check className="size-3.5" aria-hidden />
          </span>
          Choose dates
        </li>
        <li className="h-px w-8 bg-border" aria-hidden />
        <li className="flex items-center gap-2 font-semibold" aria-current="step">
          <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-xs text-white">
            2
          </span>
          Review and pay
        </li>
        <li className="h-px w-8 bg-border" aria-hidden />
        <li className="flex items-center gap-2 text-muted">
          <span className="flex size-6 items-center justify-center rounded-full border border-border text-xs">
            3
          </span>
          Confirmed
        </li>
      </ol>

      <h1 className="mb-8 text-2xl font-semibold sm:text-3xl">Review and pay</h1>

      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <BookingSection
          propertyId={property.id}
          propertyTitle={property.title}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          nights={nights}
          datesChosen={datesChosen}
          changeHref={`/property/${id}?${back.toString()}`}
          pricePerNightUsd={property.pricePerNight}
          totalUsd={total}
          cleaningFeeUsd={cleaningFee}
          serviceFeeUsd={serviceFee}
        />

        <BookingSummary
          property={property}
          checkIn={checkIn}
          checkOut={checkOut}
          guests={guests}
          nights={nights}
          subtotal={subtotal}
          cleaningFee={cleaningFee}
          serviceFee={serviceFee}
          total={total}
        />
      </div>
    </div>
  );
}
