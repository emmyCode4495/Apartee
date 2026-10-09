import SavedList from "@/components/SavedList";
import { properties } from "@/data/properties";

export const metadata = { title: "Saved stays" };

export default function SavedPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-semibold sm:text-3xl">Saved stays</h1>
      <SavedList properties={properties} />
    </div>
  );
}
