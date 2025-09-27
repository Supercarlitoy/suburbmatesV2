export default function CategoriesPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Categories Hub</h1>
        <p className="text-neutral-300 text-lg">
          Find businesses by service category across Melbourne suburbs.
        </p>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Professional Services",
            "Health & Wellness", 
            "Food & Hospitality",
            "Home & Construction",
            "Retail & Shopping",
            "Technology",
            "Personal Services",
            "Trades & Repairs"
          ].map((category) => (
            <div key={category} className="bg-white/5 rounded-lg p-6 border border-white/10">
              <h3 className="font-semibold text-lg">{category}</h3>
              <p className="text-sm text-neutral-400 mt-2">Browse verified businesses in this category</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}