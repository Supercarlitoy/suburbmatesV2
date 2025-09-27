export default function SuburbsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Suburbs Hub</h1>
        <p className="text-neutral-300 text-lg">
          Explore businesses across Melbourne suburbs. Browse by location to find verified local services.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {["Brunswick", "Fitzroy", "Carlton", "Northcote", "Richmond", "South Yarra"].map((suburb) => (
            <div key={suburb} className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h3 className="font-semibold">{suburb}</h3>
              <p className="text-sm text-neutral-400 mt-1">Verified businesses available</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}