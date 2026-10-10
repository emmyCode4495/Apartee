"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MessageCircle, X, Send, Bot } from "lucide-react";

type Msg = { role: "bot" | "user"; text: string };

const FAQ: { keys: string[]; answer: string }[] = [
  {
    keys: ["book", "booking", "reserve", "reservation", "how to book"],
    answer:
      "Search by city and dates, open a listing, pick check-in/out and guests, then tap Reserve. You’ll need to sign in before completing a booking.",
  },
  {
    keys: ["price", "naira", "dollar", "currency", "cost", "fee"],
    answer:
      "Guests in Nigeria see prices in naira (₦); others see dollars. The total includes the nightly rate, cleaning fee, and service fee — shown before you pay.",
  },
  {
    keys: ["cancel", "cancellation", "refund"],
    answer:
      "Cancellation depends on the listing and how close you are to check-in. Contact us with your booking details and we’ll help coordinate with the host.",
  },
  {
    keys: ["check-in", "check in", "access", "key", "code"],
    answer:
      "After confirmation, your host shares check-in details (address, access, timing) by email or in your account.",
  },
  {
    keys: ["account", "sign in", "login", "sign up", "google"],
    answer:
      "Use Sign in / Sign up in the header. Google sign-in is available if it’s enabled in the project. You need an account to complete a booking.",
  },
  {
    keys: ["host", "superhost", "agency", "company"],
    answer:
      "Each stay lists a host (and sometimes a verified real estate agency). Host details appear on the property page after you open a listing.",
  },
  {
    keys: ["payment", "pay", "card"],
    answer:
      "Payment is collected when you complete the booking flow. You won’t be charged until you confirm the reservation.",
  },
  {
    keys: ["contact", "support", "help", "human", "agent"],
    answer:
      "For a person, use Contact us. For self-serve answers, open the Help center.",
  },
];

function replyTo(input: string): string {
  const q = input.toLowerCase().trim();
  if (!q) {
    return "Ask about booking, prices, check-in, or cancellations — or go to Contact us.";
  }
  for (const item of FAQ) {
    if (item.keys.some((k) => q.includes(k))) return item.answer;
  }
  return "I’m not sure about that yet. Try the Help center, or Contact us and our team will reply (usually within one business day).";
}

const STARTER: Msg[] = [
  {
    role: "bot",
    text: "Hi — I’m the Apatmentz assistant. Ask about booking, payments, check-in, or cancellations.",
  },
];

export default function FloatingChatbot() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>(STARTER);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function send(text?: string) {
    const value = (text ?? input).trim();
    if (!value) return;
    setInput("");
    setMessages((m) => [
      ...m,
      { role: "user", text: value },
      { role: "bot", text: replyTo(value) },
    ]);
  }

  return (
    <div className="fixed bottom-5 right-4 z-[150] sm:bottom-6 sm:right-6">
      {open && (
        <div
          className="mb-3 flex h-[min(28rem,70dvh)] w-[min(22rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lift"
          role="dialog"
          aria-label="Chat assistant"
        >
          <div className="flex items-center justify-between gap-2 border-b border-border bg-primary px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="size-5" />
              <div>
                <p className="text-sm font-semibold">Apatmentz help</p>
                <p className="text-xs text-white/80">Quick answers</p>
              </div>
            </div>
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 hover:bg-white/15"
            >
              <X className="size-5" />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "bg-primary text-white"
                      : "bg-surface text-foreground"
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          <div className="border-t border-border px-3 py-2">
            <div className="mb-2 flex flex-wrap gap-1.5">
              {["How do I book?", "Prices", "Check-in", "Contact"].map((chip) => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => send(chip)}
                  className="rounded-full border border-border px-2.5 py-1 text-xs font-medium hover:bg-surface"
                >
                  {chip}
                </button>
              ))}
            </div>
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a question…"
                className="h-10 flex-1 rounded-xl border border-border bg-background px-3 text-sm outline-none focus:border-primary"
              />
              <button
                type="submit"
                aria-label="Send"
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white hover:bg-primary-hover"
              >
                <Send className="size-4" />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-muted">
              <Link href="/help" className="text-primary hover:underline">
                Help center
              </Link>
              {" · "}
              <Link href="/contact" className="text-primary hover:underline">
                Contact us
              </Link>
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? "Close chat" : "Open chat"}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lift transition hover:bg-primary-hover"
      >
        {open ? <X className="size-6" /> : <MessageCircle className="size-6" />}
      </button>
    </div>
  );
}
