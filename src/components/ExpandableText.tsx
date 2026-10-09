"use client";

import { useState } from "react";

export default function ExpandableText({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > 320;

  return (
    <div>
      <p className={`max-w-prose leading-relaxed text-muted ${!open && long ? "line-clamp-4" : ""}`}>
        {text}
      </p>
      {long && (
        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
          className="mt-3 text-sm font-semibold underline underline-offset-4 transition hover:text-primary"
        >
          {open ? "Show less" : "Show more"}
        </button>
      )}
    </div>
  );
}
