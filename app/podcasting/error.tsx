"use client"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-10 md:py-14">
      <h1 className="text-2xl font-semibold">Something went wrong</h1>
      <p className="mt-2 text-muted-foreground">{error.message || 'We could not load this page.'}</p>
      <button
        onClick={() => reset()}
        className="mt-6 inline-flex items-center rounded-md border px-4 py-2 text-sm hover:bg-gray-50"
      >
        Try again
      </button>
    </div>
  )
}

