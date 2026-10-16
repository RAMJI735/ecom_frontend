export default function ProductCategoriesPage() {
  const categories = [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">Product Categories</h1>
          <p className="text-sm text-base-content/70">Inventory classification and parts cataloging.</p>
        </div>
        <button className="btn btn-primary btn-sm">+ Add Category</button>
      </div>

      {categories.length === 0 ? (
        <div className="card bg-base-100 border border-base-300 shadow-sm p-12 text-center">
          <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-2xl mb-3">
              📂
            </div>
            <h4 className="font-semibold text-base text-base-content">No Categories Found</h4>
            <p className="text-xs text-base-content/60 mt-1">
              Add product categories to classify parts and organize your catalog.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="card bg-base-100 border border-base-300 shadow-sm">
              <div className="card-body">
                <h2 className="card-title text-base font-semibold">{cat.title}</h2>
                <p className="text-sm text-base-content/70">{cat.description}</p>
                <div className="card-actions justify-between items-center mt-3 pt-2 border-t border-base-200">
                  <span className="badge badge-neutral badge-sm">{cat.count} Items</span>
                  <button className="btn btn-ghost btn-xs">View Products</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
