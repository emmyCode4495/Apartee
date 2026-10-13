import { Resend } from "resend";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export type PaymentReceiptPayload = {
  to: string;
  paymentRef: string;
  guestName: string;
  propertyTitle?: string;
  checkIn: string;
  checkOut: string;
  amountLabel: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  integrityHint?: string;
};

export async function sendPaymentReceiptEmail(
  payload: PaymentReceiptPayload
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const resend = getResend();
  const from =
    process.env.RESEND_FROM_EMAIL || "Apatmentz <onboarding@resend.dev>";

  if (!resend) {
    return {
      ok: false,
      error: "RESEND_API_KEY is not set — receipt not sent automatically",
    };
  }

  const subject = `Apatmentz payment receipt · ${payload.paymentRef}`;
  const html = `
  <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <h1 style="font-size:20px;margin:0 0 8px">Payment receipt</h1>
    <p style="color:#64748b;margin:0 0 20px">Your claim was recorded. Booking is confirmed only after we verify the transfer.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">
      <tr><td style="padding:8px 0;color:#64748b">Payment ID</td><td style="padding:8px 0;font-weight:700;letter-spacing:0.04em">${payload.paymentRef}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Guest</td><td style="padding:8px 0">${payload.guestName}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Stay</td><td style="padding:8px 0">${payload.propertyTitle || "—"}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Dates</td><td style="padding:8px 0">${payload.checkIn} → ${payload.checkOut}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Amount</td><td style="padding:8px 0;font-weight:600">${payload.amountLabel}</td></tr>
      <tr><td style="padding:8px 0;color:#64748b">Bank</td><td style="padding:8px 0">${payload.bankName}<br/>${payload.accountName}<br/>${payload.accountNumber}</td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:12px;color:#94a3b8">
      Keep this Payment ID unchanged. Our team matches it to your bank narration.
      ${payload.integrityHint ? `<br/>Seal: ${payload.integrityHint}` : ""}
    </p>
  </div>`;

  const text = [
    "APATMENTZ PAYMENT RECEIPT (pending admin confirmation)",
    `Payment ID: ${payload.paymentRef}`,
    `Guest: ${payload.guestName}`,
    `Stay: ${payload.propertyTitle || "—"}`,
    `Dates: ${payload.checkIn} → ${payload.checkOut}`,
    `Amount: ${payload.amountLabel}`,
    `Bank: ${payload.bankName} / ${payload.accountName} / ${payload.accountNumber}`,
    payload.integrityHint ? `Seal: ${payload.integrityHint}` : "",
    "",
    "Booking is not confirmed until payment is verified.",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: payload.to,
      subject,
      html,
      text,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Failed to send email",
    };
  }
}
