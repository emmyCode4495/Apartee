export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading stays">
      <div className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="skeleton h-[68px] rounded-2xl" />
        </div>
      </div>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="skeleton h-10 w-2/3 rounded-full sm:w-1/2" />
        <div className="skeleton mb-8 mt-8 h-9 w-72 rounded-lg" />
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="skeleton aspect-[4/3] rounded-xl" />
              <div className="skeleton mt-3 h-4 w-3/4 rounded" />
              <div className="skeleton mt-2 h-4 w-1/2 rounded" />
              <div className="skeleton mt-3 h-4 w-1/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
