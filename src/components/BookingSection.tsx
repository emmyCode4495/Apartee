"use client";

import { Suspense } from "react";
import AuthGate from "@/components/auth/AuthGate";
import BookingForm from "@/components/BookingForm";

interface Props {
  propertyId: string;
  propertyTitle?: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  nights: number;
  datesChosen: boolean;
  changeHref: string;
  pricePerNightUsd: number;
  totalUsd: number;
  cleaningFeeUsd: number;
  serviceFeeUsd: number;
}

export default function BookingSection(props: Props) {
  return (
    <Suspense
      fallback={
        <div className="h-64 animate-pulse rounded-3xl bg-surface" />
      }
    >
      <AuthGate message="Sign in to complete your booking. Your dates and price stay saved.">
        <BookingForm {...props} />
      </AuthGate>
    </Suspense>
  );
}
