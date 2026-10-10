import SavedList from "@/components/SavedList";
import { getProperties } from "@/lib/data";

export const metadata = { title: "Saved stays" };
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function SavedPage() {
  const properties = await getProperties({ publishedOnly: true });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold sm:text-3xl">Saved stays</h1>
      <SavedList properties={properties} />
    </div>
  );
}
