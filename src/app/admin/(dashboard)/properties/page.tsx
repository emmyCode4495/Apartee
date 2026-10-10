export const dynamic = "force-dynamic";
export const revalidate = 0;
import { adminPath } from "@/lib/admin-path";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { getAllPropertiesAdmin } from "@/lib/data";
import { formatMoney } from "@/lib/currency";
import PropertyActions from "@/components/admin/PropertyActions";

export default async function AdminPropertiesPage() {
  const properties = await getAllPropertiesAdmin();

  return (
    <div>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Properties</h1>
          <p className="mt-1 text-sm text-muted">
            {properties.length} listing{properties.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href={adminPath("/properties/new")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-hover"
        >
          <Plus className="h-4 w-4" />
          Add property
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card card-shadow">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border bg-surface/50 text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Property</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Price / night</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Rating</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {properties.map((p) => (
                <tr key={p.id} className="hover:bg-surface/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg">
                        {p.images[0] && (
                          <Image
                            unoptimized
                            src={p.images[0]}
                            alt=""
                            fill
                            className="object-cover"
                            sizes="64px"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium line-clamp-1">{p.title}</p>
                        <p className="text-xs text-muted">{p.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 capitalize text-muted">{p.type}</td>
                  <td className="px-4 py-3 font-medium">
                    {formatMoney(p.pricePerNight, "USD")}
                    <span className="block text-[10px] text-muted">
                      ≈ {formatMoney(p.pricePerNight, "NGN")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {p.isPublished !== false ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                        <Eye className="h-3 w-3" /> Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                        <EyeOff className="h-3 w-3" /> Draft
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    {p.rating} ({p.reviewCount})
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={adminPath(`/properties/${p.id}/edit`)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border hover:bg-surface"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Link>
                      <PropertyActions id={p.id} published={p.isPublished !== false} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
