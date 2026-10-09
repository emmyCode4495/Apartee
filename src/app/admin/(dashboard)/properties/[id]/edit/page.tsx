import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import PropertyForm from "@/components/admin/PropertyForm";
import { getPropertyById } from "@/lib/data";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditPropertyPage({ params }: Props) {
  const { id } = await params;
  const property = await getPropertyById(id);
  if (!property) notFound();

  return (
    <div>
      <Link
        href="/admin/properties"
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Link>
      <h1 className="mb-6 text-2xl font-bold">Edit property</h1>
      <PropertyForm initial={property} />
    </div>
  );
}
