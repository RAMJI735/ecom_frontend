export default function ServiceReportPage() {
  const kpis = [
    { label: "Completed Service Jobs", val: "142", trend: "+18%" },
    { label: "Avg. Resolution Time", val: "2.4 hrs", trend: "-12%" },
    { label: "Customer Satisfaction", val: "4.8 / 5.0", trend: "+0.2" },
    { label: "First-Time Fix Rate", val: "91.5%", trend: "+3.1%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">Service Performance</h1>
          <p className="text-sm text-base-content/70">Metrics on technician efficiency, repair turnaround, and customer ratings.</p>
        </div>
        <select className="select select-bordered select-sm">
          <option>Last 30 Days</option>
          <option>This Month</option>
          <option>Year to Date</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => (
          <div key={i} className="card bg-base-100 border border-base-300 shadow-sm p-4">
            <span className="text-xs font-semibold uppercase text-base-content/60">{k.label}</span>
            <div className="text-2xl font-bold mt-1">{k.val}</div>
            <span className="text-xs text-success font-semibold mt-2">{k.trend} vs last month</span>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm p-6 text-center text-base-content/60 py-16">
        <div className="max-w-md mx-auto space-y-2">
          <div className="text-4xl">🛠️</div>
          <h3 className="font-semibold text-base-content">Turnaround & SLA Tracking</h3>
          <p className="text-xs">Detailed service ticket lifecycle metrics and technician performance breakdown.</p>
        </div>
      </div>
    </div>
  );
}
