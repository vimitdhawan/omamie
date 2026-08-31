export default function BrowsePropertiesLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-white py-12">
        <div className="container mx-auto max-w-screen-2xl px-4 md:px-12">
          <div className="flex flex-col items-center gap-6">
            <div className="h-10 w-64 animate-pulse rounded-lg bg-gray-200" />
            <div className="h-12 w-full max-w-4xl animate-pulse rounded-full bg-gray-200" />
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-screen-2xl px-4 py-8 md:px-12">
        <div className="flex gap-6">
          <div className="hidden h-96 w-64 animate-pulse rounded-lg bg-gray-200 md:block" />
          <div className="flex-1">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="h-96 animate-pulse rounded-lg bg-gray-200"
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
