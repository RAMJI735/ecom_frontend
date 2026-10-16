export default function SalesReportPage() {
  const metrics = [
    { title: "Total Revenue (MTD)", value: "$24,520", growth: "+14.2%" },
    { title: "Parts & Equipment Sales", value: "$16,200", growth: "+8.1%" },
    { title: "Average Order Value", value: "$142", growth: "+3.5%" },
    { title: "Refunds / Returns", value: "$320", growth: "-1.2%" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">Sales Analytics</h1>
          <p className="text-sm text-base-content/70">Financial overview, hardware sales, and revenue velocity.</p>
        </div>
        <select className="select select-bordered select-sm">
          <option>Last 30 Days</option>
          <option>This Quarter</option>
          <option>This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, idx) => (
          <div key={idx} className="card bg-base-100 border border-base-300 shadow-sm p-4">
            <span className="text-xs font-semibold uppercase text-base-content/60">{m.title}</span>
            <div className="text-2xl font-bold mt-1 text-base-content">{m.value}</div>
            <span className={`text-xs font-semibold mt-2 ${m.growth.startsWith('+') ? 'text-success' : 'text-warning'}`}>
              {m.growth} from previous period
            </span>
          </div>
        ))}
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm p-6 text-center text-base-content/60 py-16">
        <div className="max-w-md mx-auto space-y-2">
          <div className="text-4xl">📊</div>
          <h3 className="font-semibold text-base-content">Sales Chart Visualization</h3>
          <p className="text-xs">Connect your charting library (e.g. Chart.js, Recharts, or Tremor) here to view monthly time-series breakdowns.</p>
        </div>
      </div>
    </div>
  );
}
