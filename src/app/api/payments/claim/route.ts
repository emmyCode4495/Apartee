import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPaymentSignature } from "@/lib/payment-secure";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentRef, bookingId, guestEmail, signature, checkIn, checkOut, currency, amountDisplay } =
      body;

    if (!paymentRef) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, warning: "No database" });
    }

    // Load booking by ref — never trust client amount alone
    const { data: row, error: findErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("payment_ref", paymentRef)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json({ error: findErr.message }, { status: 400 });
    }
    if (!row) {
      return NextResponse.json({ error: "Unknown Payment ID" }, { status: 404 });
    }

    if (row.payment_status === "confirmed") {
      return NextResponse.json({ error: "Already confirmed" }, { status: 400 });
    }

    // Optional integrity check when signature present
    if (signature && row.payment_signature) {
      const secret =
        process.env.PAYMENT_HMAC_SECRET ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        "apatmentz-dev-secret-change-me";
      const ok = await verifyPaymentSignature(
        secret,
        {
          paymentRef,
          propertyId: String(row.property_id || ""),
          amount: Number(row.total_usd),
          currency: String(row.currency || "NGN"),
          checkIn: String(row.check_in),
          checkOut: String(row.check_out),
          guestEmail: String(row.guest_email),
        },
        String(row.payment_signature)
      );
      if (!ok) {
        return NextResponse.json(
          { error: "Integrity check failed — contact support with your Payment ID" },
          { status: 400 }
        );
      }
    }

    const { error: upErr } = await supabase
      .from("bookings")
      .update({
        payment_status: "claimed_paid",
        payment_claimed_at: new Date().toISOString(),
      })
      .eq("payment_ref", paymentRef);

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 400 });
    }

    return NextResponse.json({
      ok: true,
      paymentRef,
      message: "Claim recorded. Admin will verify the transfer.",
      guestEmail,
      amountDisplay,
      currency,
      bookingId: bookingId || row.id,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
