export default function CustomersPage() {
  const customers = [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">Customers</h1>
          <p className="text-sm text-base-content/70">Client directory, service history, and purchase lifetime values.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" disabled={customers.length === 0}>Export CSV</button>
          <button className="btn btn-primary btn-sm">+ Add Customer</button>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="border-b border-base-300 text-xs uppercase text-base-content/60">
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Segment</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-base-content/60">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-2xl mb-3">
                        👥
                      </div>
                      <h4 className="font-semibold text-base text-base-content">No Customers Found</h4>
                      <p className="text-xs text-base-content/60 mt-1">
                        Registered client accounts and service customers will appear in this directory.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="font-semibold text-base-content">{c.name}</div>
                      <div className="text-xs font-mono text-base-content/50">{c.id}</div>
                    </td>
                    <td>
                      <div className="text-sm">{c.email}</div>
                      <div className="text-xs text-base-content/60">{c.phone}</div>
                    </td>
                    <td className="font-medium">{c.totalOrders}</td>
                    <td className="font-mono font-semibold">{c.spent}</td>
                    <td>
                      <span
                        className={`badge badge-sm font-semibold ${
                          c.status === "VIP"
                            ? "badge-primary"
                            : c.status === "New"
                            ? "badge-accent"
                            : "badge-ghost"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="text-right">
                      <button className="btn btn-ghost btn-xs">View</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
