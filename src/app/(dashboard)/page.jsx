import Link from "next/link";

export default function Home() {
  const stats = [
    { title: "Total Revenue", value: "$18,420", desc: "+12% from last month", badge: "badge-success", badgeText: "Up" },
    { title: "Active Service Requests", value: "24", desc: "4 high urgency", badge: "badge-warning", badgeText: "Action Needed" },
    { title: "Pending Orders", value: "12", desc: "3 awaiting dispatch", badge: "badge-info", badgeText: "Processing" },
    { title: "Field Technicians", value: "8 / 10", desc: "Currently on duty", badge: "badge-accent", badgeText: "Active" },
  ];

  const recentRequests = [];

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">
            Operations Dashboard
          </h1>
          <p className="text-sm text-base-content/70">
            Real-time overview of electrical services, repairs, orders, and technician workload.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/services/new" className="btn btn-primary btn-sm">
            + New Service
          </Link>
          <Link href="/services/requests" className="btn btn-outline btn-sm">
            View Requests
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, idx) => (
          <div key={idx} className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-base-content/60 uppercase">{s.title}</span>
                <span className={`badge badge-xs font-medium ${s.badge}`}>{s.badgeText}</span>
              </div>
              <div className="text-2xl font-bold tracking-tight text-base-content mt-1">{s.value}</div>
              <div className="text-xs text-base-content/60 mt-1">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid: Recent Service Requests + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card bg-base-100 border border-base-300 shadow-sm">
          <div className="card-body p-0">
            <div className="p-4 border-b border-base-200 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-base text-base-content">Recent Service Requests</h2>
                <p className="text-xs text-base-content/60">Urgent customer service tickets needing assignment</p>
              </div>
              <Link href="/services/requests" className="btn btn-ghost btn-xs text-primary">
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead>
                  <tr className="text-xs uppercase text-base-content/60 border-b border-base-200">
                    <th>Ticket</th>
                    <th>Customer</th>
                    <th>Service</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentRequests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-12 text-base-content/60">
                        <div className="flex flex-col items-center justify-center max-w-xs mx-auto">
                          <span className="text-2xl mb-1">🎫</span>
                          <span className="font-semibold text-sm text-base-content">No Recent Requests</span>
                          <span className="text-xs text-base-content/60 mt-0.5">New incoming service requests will appear here.</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    recentRequests.map((req) => (
                      <tr key={req.id}>
                        <td className="font-mono text-xs font-semibold text-primary">{req.id}</td>
                        <td className="font-medium text-sm text-base-content">{req.customer}</td>
                        <td className="text-xs">{req.service}</td>
                        <td>
                          <span
                            className={`badge badge-xs font-semibold ${
                              req.priority === "Critical"
                                ? "badge-error"
                                : req.priority === "High"
                                ? "badge-warning"
                                : "badge-ghost"
                            }`}
                          >
                            {req.priority}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info badge-sm">{req.status}</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Links & Shortcuts */}
        <div className="space-y-4">
          <div className="card bg-base-100 border border-base-300 shadow-sm">
            <div className="card-body p-4 space-y-3">
              <h3 className="font-semibold text-sm">Quick Actions</h3>
              <div className="flex flex-col gap-2">
                <Link href="/products/inventory" className="btn btn-sm btn-outline justify-between">
                  <span>Check Inventory Alerts</span>
                  <span className="badge badge-warning badge-xs">12 Low</span>
                </Link>
                <Link href="/orders/pending" className="btn btn-sm btn-outline justify-between">
                  <span>Dispatch Pending Orders</span>
                  <span className="badge badge-primary badge-xs">3 Pending</span>
                </Link>
                <Link href="/technicians/assignments" className="btn btn-sm btn-outline justify-between">
                  <span>Technician Dispatch Board</span>
                  <span>→</span>
                </Link>
                <Link href="/reports/sales" className="btn btn-sm btn-outline justify-between">
                  <span>Monthly Sales Report</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>

          <div className="card bg-primary text-primary-content shadow-sm">
            <div className="card-body p-4">
              <h3 className="font-bold text-sm">Technician On-Call</h3>
              <p className="text-xs opacity-90 mt-1">
                4 technicians are currently handling field tickets. Ensure emergency slots remain open.
              </p>
              <div className="card-actions justify-end mt-2">
                <Link href="/technicians" className="btn btn-sm btn-ghost bg-primary-content/20 hover:bg-primary-content/30 text-primary-content">
                  View Roster
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
