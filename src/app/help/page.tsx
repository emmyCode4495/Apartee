import Link from "next/link";
import type { Metadata } from "next";
import {
  HelpCircle,
  CalendarCheck,
  CreditCard,
  KeyRound,
  Shield,
  MessageCircle,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Help center",
  description:
    "Answers about booking, payments, check-in, and cancellations on Apatmentz.",
};

const topics = [
  {
    icon: CalendarCheck,
    title: "Booking a stay",
    body: "Search by city and dates, review the full price (including fees), then reserve. You’ll need an account before completing a booking.",
  },
  {
    icon: CreditCard,
    title: "Payments & pricing",
    body: "Prices are shown in naira for guests in Nigeria and in dollars elsewhere. The total on the listing includes the nightly rate, cleaning fee, and service fee.",
  },
  {
    icon: KeyRound,
    title: "Check-in & access",
    body: "After your booking is confirmed, the host shares check-in details (address, access codes, and timing) by email or in your account.",
  },
  {
    icon: Shield,
    title: "Cancellations",
    body: "Cancellation terms depend on the listing and how close you are to check-in. Contact support as soon as you need to change plans so we can help with the host.",
  },
  {
    icon: MessageCircle,
    title: "Talking to your host",
    body: "Use the contact details shared after confirmation for arrival questions. For payment or account issues, use Contact us instead.",
  },
];

const faqs = [
  {
    q: "Do I need an account to book?",
    a: "Yes. Sign in or create an account (email or Google) before you reserve so we can confirm your booking and send details.",
  },
  {
    q: "Why do I see naira or dollars?",
    a: "We detect your region and show local currency where possible. You can switch currency in the header if you prefer.",
  },
  {
    q: "Who verifies the apartments?",
    a: "Listings are reviewed by our team. Many are tied to registered real estate agencies; others are published as public listings after checks.",
  },
  {
    q: "What if something is wrong with my stay?",
    a: "Message your host first for practical issues. If you need help from Apatmentz, open Contact us with your booking details.",
  },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10">
        <p className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-primary">
          <HelpCircle className="size-4" />
          Help center
        </p>
        <h1 className="text-3xl font-semibold sm:text-4xl">How can we help?</h1>
        <p className="mt-3 text-lg text-muted">
          Quick answers about booking apartments on Apatmentz. Still stuck?{" "}
          <Link
            href="/contact"
            className="font-semibold text-primary hover:underline"
          >
            Contact us
          </Link>
          .
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {topics.map(({ icon: Icon, title, body }) => (
          <div
            key={title}
            className="rounded-2xl border border-border bg-card p-5 shadow-soft"
          >
            <span className="flex size-10 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Icon className="size-5" />
            </span>
            <h2 className="mt-3 font-semibold">{title}</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
          </div>
        ))}
      </div>

      <section className="mt-14">
        <h2 className="text-xl font-semibold">Frequently asked</h2>
        <ul className="mt-6 space-y-4">
          {faqs.map((f) => (
            <li
              key={f.q}
              className="rounded-2xl border border-border bg-card px-5 py-4"
            >
              <h3 className="font-semibold">{f.q}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">{f.a}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-12 rounded-2xl border border-border bg-surface p-6 text-center">
        <p className="font-semibold">Need a human?</p>
        <p className="mt-1 text-sm text-muted">
          Our team is available for booking and account questions.
        </p>
        <Link
          href="/contact"
          className="mt-4 inline-flex h-11 items-center rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          Contact us
        </Link>
      </div>
    </div>
  );
}
