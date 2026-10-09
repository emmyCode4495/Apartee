"use client";

import { useRef, useState } from "react";
import { Link2, Upload, X, FileText, ImageIcon } from "lucide-react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

type Props = {
  label: string;
  hint?: string;
  values: string[];
  onChange: (urls: string[]) => void;
  /** Supabase storage bucket for file uploads */
  bucket?: string;
  accept?: string;
  multiple?: boolean;
};

/**
 * Collects media as remote URLs and/or local file uploads.
 * Uploads go to Supabase Storage when configured; otherwise files become data URLs (demo).
 */
export default function MediaField({
  label,
  hint,
  values,
  onChange,
  bucket = "property-images",
  accept = "image/*,.pdf",
  multiple = true,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  function addUrl() {
    const u = urlInput.trim();
    if (!u) return;
    try {
      new URL(u);
    } catch {
      setError("Enter a valid URL (https://…)");
      return;
    }
    setError("");
    if (!values.includes(u)) onChange([...values, u]);
    setUrlInput("");
  }

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setError("");
    const next = [...values];

    try {
      for (const file of Array.from(files)) {
        if (isSupabaseConfigured()) {
          const supabase = createClient();
          if (!supabase) throw new Error("Supabase client unavailable");
          const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
          const { error: upErr } = await supabase.storage
            .from(bucket)
            .upload(path, file, { upsert: true, contentType: file.type });
          if (upErr) throw upErr;
          const { data } = supabase.storage.from(bucket).getPublicUrl(path);
          next.push(data.publicUrl);
        } else {
          // Demo: inline data URL (fine for local testing; prefer Supabase in production)
          const dataUrl = await readAsDataURL(file);
          next.push(dataUrl);
        }
      }
      onChange(next);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setBusy(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    onChange(values.filter((_, idx) => idx !== i));
  }

  const field =
    "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm outline-none focus:border-primary";

  return (
    <div className="space-y-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Link2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addUrl();
              }
            }}
            placeholder="https://example.com/image.jpg"
            className={`${field} pl-9`}
          />
        </div>
        <button
          type="button"
          onClick={addUrl}
          className="rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:bg-surface"
        >
          Add URL
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60"
        >
          <Upload className="size-4" />
          {busy ? "Uploading…" : "Upload"}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept={accept}
          multiple={multiple}
          className="hidden"
          onChange={(e) => onFiles(e.target.files)}
        />
      </div>

      {error && (
        <p className="text-sm text-danger" role="alert">
          {error}
        </p>
      )}

      {values.length > 0 && (
        <ul className="space-y-2">
          {values.map((v, i) => {
            const isImg =
              v.startsWith("data:image") ||
              /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(v);
            return (
              <li
                key={`${v.slice(0, 40)}-${i}`}
                className="flex items-center gap-3 rounded-xl border border-border bg-background p-2"
              >
                <div className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface">
                  {isImg ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={v} alt="" className="size-full object-cover" />
                  ) : (
                    <FileText className="size-5 text-muted" />
                  )}
                </div>
                <p className="min-w-0 flex-1 truncate text-xs text-muted">{v}</p>
                <button
                  type="button"
                  aria-label="Remove"
                  onClick={() => removeAt(i)}
                  className="rounded-lg p-2 text-muted hover:bg-surface hover:text-danger"
                >
                  <X className="size-4" />
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {values.length === 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-6 text-sm text-muted">
          <ImageIcon className="size-4" />
          No files yet — paste a URL or upload from your device.
        </div>
      )}
    </div>
  );
}

function readAsDataURL(file: File) {
  return new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read file"));
    r.readAsDataURL(file);
  });
}
