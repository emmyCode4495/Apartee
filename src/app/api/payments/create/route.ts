import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { signPaymentPayload } from "@/lib/payment-secure";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      paymentRef,
      propertyId,
      propertyTitle,
      checkIn,
      checkOut,
      guests,
      nights,
      pricePerNightUsd,
      cleaningFeeUsd,
      serviceFeeUsd,
      totalUsd,
      currency,
      amountDisplay,
      guestName,
      guestEmail,
      guestPhone,
      userId,
      bank,
    } = body;

    if (!paymentRef || !guestEmail || !checkIn || !checkOut) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const secret =
      process.env.PAYMENT_HMAC_SECRET ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      "apatmentz-dev-secret-change-me";

    const signature = await signPaymentPayload(secret, {
      paymentRef,
      propertyId: propertyId || "",
      amount: Number(totalUsd),
      currency: currency || "NGN",
      checkIn,
      checkOut,
      guestEmail,
    });

    const supabase = await createClient();
    let bookingId: string | null = null;

    if (supabase) {
      const uuidOk =
        typeof propertyId === "string" &&
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
          propertyId
        );

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          property_id: uuidOk ? propertyId : null,
          user_id: userId || null,
          guest_name: guestName,
          guest_email: guestEmail,
          guest_phone: guestPhone || null,
          check_in: checkIn,
          check_out: checkOut,
          guests: guests || 1,
          nights: nights || 1,
          price_per_night_usd: pricePerNightUsd,
          cleaning_fee_usd: cleaningFeeUsd,
          service_fee_usd: serviceFeeUsd,
          total_usd: totalUsd,
          currency: currency || "NGN",
          total_display: amountDisplay,
          status: "pending",
          payment_ref: paymentRef,
          payment_status: "awaiting_transfer",
          payment_amount_usd: totalUsd,
          payment_amount_display: amountDisplay,
          payment_currency: currency || "NGN",
          payment_signature: signature,
          bank_account_snapshot: bank || null,
        })
        .select("id")
        .maybeSingle();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      bookingId = data?.id ?? null;
    }

    return NextResponse.json({
      ok: true,
      bookingId,
      paymentRef,
      signature,
      propertyTitle,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
