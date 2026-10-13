import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifyPaymentSignature } from "@/lib/payment-secure";
import { sendPaymentReceiptEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      paymentRef,
      bookingId,
      guestEmail,
      guestName,
      propertyTitle,
      signature,
      checkIn,
      checkOut,
      currency,
      amountDisplay,
    } = body;

    if (!paymentRef) {
      return NextResponse.json({ error: "Payment ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    if (!supabase) {
      return NextResponse.json({ ok: true, warning: "No database" });
    }

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
          {
            error:
              "Integrity check failed — contact support with your Payment ID",
          },
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

    const bank = (row.bank_account_snapshot || {}) as {
      bankName?: string;
      accountName?: string;
      accountNumber?: string;
    };

    const amountLabel = `${row.payment_currency || currency || "NGN"} ${
      row.payment_amount_display ?? amountDisplay ?? row.total_usd
    }`;

    const emailResult = await sendPaymentReceiptEmail({
      to: String(guestEmail || row.guest_email),
      paymentRef,
      guestName: String(guestName || row.guest_name || "Guest"),
      propertyTitle: propertyTitle || undefined,
      checkIn: String(checkIn || row.check_in),
      checkOut: String(checkOut || row.check_out),
      amountLabel,
      bankName: bank.bankName || process.env.NEXT_PUBLIC_PAYMENT_BANK_NAME || "Bank",
      accountName:
        bank.accountName ||
        process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NAME ||
        "Apatmentz",
      accountNumber:
        bank.accountNumber ||
        process.env.NEXT_PUBLIC_PAYMENT_ACCOUNT_NUMBER ||
        "",
      integrityHint: row.payment_signature
        ? String(row.payment_signature).slice(0, 16)
        : undefined,
    });

    return NextResponse.json({
      ok: true,
      paymentRef,
      message: "Claim recorded. Admin will verify the transfer.",
      guestEmail: guestEmail || row.guest_email,
      amountDisplay,
      currency,
      bookingId: bookingId || row.id,
      email: emailResult,
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Server error" },
      { status: 500 }
    );
  }
}
