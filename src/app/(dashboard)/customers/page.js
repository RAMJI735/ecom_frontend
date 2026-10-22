"use client";

import { useState, useEffect, useMemo } from "react";
import Pagination from "@/components/Pagination";
import { orderService } from "@service/order/orderService";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter & Pagination state
  const [searchQuery, setSearchQuery] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true);
      try {
        const res = await orderService.read({ all: true });
        const orders = Array.isArray(res?.data) ? res.data : [];

        // Aggregate unique customer profiles from order records
        const customerMap = new Map();

        orders.forEach((o) => {
          const name = o.shippingAddress?.fullName || o.customerName || "Customer";
          const email = o.shippingAddress?.email || o.customerEmail || "customer@example.com";
          const phone = o.shippingAddress?.phone || "N/A";
          const key = email !== "customer@example.com" ? email : `${name}-${phone}`;

          if (!customerMap.has(key)) {
            customerMap.set(key, {
              id: `CUST-${customerMap.size + 1001}`,
              name,
              email,
              phone,
              totalOrders: 0,
              totalSpentNum: 0,
              status: "Regular",
            });
          }

          const existing = customerMap.get(key);
          existing.totalOrders += 1;
          existing.totalSpentNum += Number(o.summary?.grandTotal || 0);
          if (existing.totalSpentNum > 10000 || existing.totalOrders >= 5) {
            existing.status = "VIP";
          } else if (existing.totalOrders === 1) {
            existing.status = "New";
          }
        });

        // Convert to array
        const list = Array.from(customerMap.values()).map((c) => ({
          ...c,
          spent: `₹${c.totalSpentNum.toLocaleString("en-IN")}`,
        }));

        setCustomers(list);
      } catch (err) {
        console.error("Failed to load customer list:", err);
        setCustomers([]);
      } finally {
        setLoading(false);
      }
    }

    loadCustomers();
  }, []);

  // Filter customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q);

      const matchesSegment = segmentFilter === "all" || c.status === segmentFilter;

      return matchesSearch && matchesSegment;
    });
  }, [customers, searchQuery, segmentFilter]);

  const total = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  useEffect(() => {
    if (page > totalPages) {
      setPage(1);
    }
  }, [page, totalPages]);

  const paginatedCustomers = useMemo(() => {
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    return filteredCustomers.slice(start, start + limit);
  }, [filteredCustomers, page, totalPages, limit]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">Customers</h1>
          <p className="text-sm text-base-content/70">
            Client directory, service history, and purchase lifetime values.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn btn-outline btn-sm" disabled={customers.length === 0}>
            Export CSV
          </button>
          <button className="btn btn-primary btn-sm">+ Add Customer</button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card bg-base-100 border border-base-300 shadow-xs p-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by customer name, email, phone, or ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="input input-bordered input-sm w-full focus:input-primary"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={segmentFilter}
              onChange={(e) => {
                setSegmentFilter(e.target.value);
                setPage(1);
              }}
              className="select select-bordered select-sm focus:select-primary"
            >
              <option value="all">All Segments</option>
              <option value="VIP">VIP</option>
              <option value="Regular">Regular</option>
              <option value="New">New</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="border-b border-base-300 text-xs uppercase text-base-content/60 bg-base-200/50">
                <th>Customer Name</th>
                <th>Contact</th>
                <th>Total Orders</th>
                <th>Total Spent</th>
                <th>Segment</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </td>
                </tr>
              ) : paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-base-content/60">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-2xl mb-3">
                        👥
                      </div>
                      <h4 className="font-semibold text-base text-base-content">No Customers Found</h4>
                      <p className="text-xs text-base-content/60 mt-1">
                        {searchQuery
                          ? `No customer records matching "${searchQuery}".`
                          : "Registered client accounts and service customers will appear in this directory."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-base-200/30 transition">
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

        {/* Pagination Bar */}
        {!loading && total > 0 && (
          <Pagination
            page={page}
            total={total}
            limit={limit}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="customers"
            name="customers-pagination"
          />
        )}
      </div>
    </div>
  );
}
