export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <div className="mb-8 md:mb-12">
        <div className="h-8 w-48 bg-gray-200 rounded" />
        <div className="mt-3 h-4 w-96 max-w-full bg-gray-200 rounded" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="w-full aspect-video bg-gray-200" />
            <div className="p-4 space-y-3">
              <div className="h-5 w-3/4 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-2/3 bg-gray-200 rounded" />
              <div className="flex gap-2 pt-2">
                <div className="h-8 w-20 bg-gray-200 rounded" />
                <div className="h-8 w-20 bg-gray-200 rounded" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

