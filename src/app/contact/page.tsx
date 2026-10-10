"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Topic: ${subject}`,
      "",
      message,
    ].join("\n");
    const mailto = `mailto:hello@apatmentz.com?subject=${encodeURIComponent(
      `[Apatmentz] ${subject}`
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
    setSent(true);
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-10 max-w-2xl">
        <h1 className="text-3xl font-semibold sm:text-4xl">Contact us</h1>
        <p className="mt-3 text-lg text-muted">
          Questions about a booking, listing, or your account? Send a message —
          we typically reply within one business day.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Mail className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Email</p>
              <a
                href="mailto:hello@apatmentz.com"
                className="text-sm text-primary hover:underline"
              >
                hello@apatmentz.com
              </a>
            </div>
          </div>
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <Phone className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Phone</p>
              <p className="text-sm text-muted">+234 (0) 800 000 0000</p>
              <p className="text-xs text-muted">Mon–Fri, 9:00–17:00 WAT</p>
            </div>
          </div>
          <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
              <MapPin className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Office</p>
              <p className="text-sm text-muted">Lagos, Nigeria</p>
            </div>
          </div>
          <p className="text-sm text-muted">
            Looking for self-serve answers? Visit the{" "}
            <Link
              href="/help"
              className="font-semibold text-primary hover:underline"
            >
              Help center
            </Link>
            .
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-soft"
        >
          <div className="flex items-center gap-2 text-sm font-medium text-muted">
            <MessageSquare className="size-4" />
            Send a message
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Name</label>
            <input
              className={field}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Email</label>
            <input
              type="email"
              className={field}
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Topic</label>
            <select
              className={field}
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            >
              <option value="general">General question</option>
              <option value="booking">Booking support</option>
              <option value="payment">Payment & pricing</option>
              <option value="host">Host / listing</option>
              <option value="account">Account access</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Message</label>
            <textarea
              className={field}
              rows={5}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Include your booking reference if you have one."
            />
          </div>
          {sent && (
            <p className="text-sm text-primary">
              Your email app should open with the message ready to send. If it
              doesn&apos;t, write to hello@apatmentz.com directly.
            </p>
          )}
          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-white hover:bg-primary-hover"
          >
            Send message
          </button>
        </form>
      </div>
    </div>
  );
}
