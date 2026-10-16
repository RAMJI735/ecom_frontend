"use client";

import { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { orderService } from "@service/order/orderService";
import Pagination from "@/components/Pagination";

export default function OrdersView({
  initialStatus = "all",
  title = "All Orders",
  subtitle = "Overview of product purchases, service orders, and customer fulfillments.",
}) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Status update modal state
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [copiedId, setCopiedId] = useState(null);

  // Fetch all orders from backend
  const fetchOrders = async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await orderService.read({ all: true });
      const list = Array.isArray(res?.data) ? res.data : [];
      setOrders(list);

      // Compute stats
      const pendingCount = list.filter((o) =>
        ["Pending", "Placed", "Confirmed"].includes(o.orderStatus)
      ).length;
      const processingCount = list.filter((o) =>
        ["Processing", "Out for Delivery"].includes(o.orderStatus)
      ).length;
      const completedCount = list.filter((o) => o.orderStatus === "Delivered").length;
      const cancelledCount = list.filter((o) => o.orderStatus === "Cancelled").length;
      const revenue = list
        .filter((o) => o.orderStatus !== "Cancelled")
        .reduce((acc, curr) => acc + (curr.summary?.grandTotal || 0), 0);

      setStats({
        totalOrders: list.length,
        pending: pendingCount,
        processing: processingCount,
        completed: completedCount,
        cancelled: cancelledCount,
        totalRevenue: revenue,
      });

      // If active selected order is open, update its reference
      if (selectedOrder) {
        const updated = list.find((o) => (o._id || o.id) === (selectedOrder._id || selectedOrder.id));
        if (updated) setSelectedOrder(updated);
      }
    } catch (err) {
      console.error("Failed to load orders from API:", err);
      toast.error(err.response?.data?.message || "Failed to connect to Orders API");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  // Filtered orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Status filter
      if (statusFilter !== "all") {
        if (statusFilter === "Pending") {
          if (!["Pending", "Placed", "Confirmed"].includes(order.orderStatus)) return false;
        } else if (statusFilter === "Processing") {
          if (!["Processing", "Out for Delivery"].includes(order.orderStatus)) return false;
        } else if (statusFilter === "Delivered") {
          if (order.orderStatus !== "Delivered") return false;
        } else if (statusFilter === "Cancelled") {
          if (order.orderStatus !== "Cancelled") return false;
        } else {
          if (order.orderStatus?.toLowerCase() !== statusFilter.toLowerCase()) return false;
        }
      }

      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const num = (order.orderNumber || "").toLowerCase();
        const name = (order.shippingAddress?.fullName || "").toLowerCase();
        const phone = (order.shippingAddress?.phone || "").toLowerCase();
        const city = (order.shippingAddress?.city || "").toLowerCase();
        const hasItem = (order.items || []).some(
          (i) =>
            (i.name || i.item?.serviceName || i.serviceName || "").toLowerCase().includes(q)
        );
        return num.includes(q) || name.includes(q) || phone.includes(q) || city.includes(q) || hasItem;
      }

      return true;
    });
  }, [orders, statusFilter, searchQuery]);

  // Paginated list
  const paginatedOrders = useMemo(() => {
    const start = (page - 1) * limit;
    return filteredOrders.slice(start, start + limit);
  }, [filteredOrders, page, limit]);

  // Handle status update
  const handleUpdateStatus = async (orderId, newStatus, note = "") => {
    setStatusUpdating(true);
    try {
      const res = await orderService.updateStatus(orderId, { status: newStatus, note });
      toast.success(`Order marked as ${newStatus}!`);

      // Update local state
      setOrders((prev) =>
        prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            return {
              ...o,
              orderStatus: newStatus,
              timeline: res?.data?.timeline || [
                ...(o.timeline || []),
                { status: newStatus, time: new Date().toISOString(), note },
              ],
            };
          }
          return o;
        })
      );

      if (selectedOrder && (selectedOrder._id || selectedOrder.id) === orderId) {
        setSelectedOrder((prev) => ({
          ...prev,
          orderStatus: newStatus,
          timeline: res?.data?.timeline || [
            ...(prev.timeline || []),
            { status: newStatus, time: new Date().toISOString(), note },
          ],
        }));
      }
    } catch (err) {
      console.error("Update status error:", err);
      toast.error(err.response?.data?.message || "Failed to update order status");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Handle order cancel
  const handleCancelOrder = async () => {
    if (!selectedOrder) return;
    const orderId = selectedOrder._id || selectedOrder.id;
    setStatusUpdating(true);
    try {
      const res = await orderService.cancel(orderId, cancelReason || "Cancelled by admin");
      toast.success("Order cancelled successfully");

      setOrders((prev) =>
        prev.map((o) => {
          if ((o._id || o.id) === orderId) {
            return {
              ...o,
              orderStatus: "Cancelled",
              cancelReason: cancelReason || "Cancelled by admin",
              timeline: res?.data?.timeline || [
                ...(o.timeline || []),
                { status: "Cancelled", time: new Date().toISOString(), note: cancelReason },
              ],
            };
          }
          return o;
        })
      );

      setSelectedOrder((prev) => ({
        ...prev,
        orderStatus: "Cancelled",
        cancelReason: cancelReason || "Cancelled by admin",
      }));

      setCancelModalOpen(false);
      setCancelReason("");
    } catch (err) {
      console.error("Cancel order error:", err);
      toast.error(err.response?.data?.message || "Failed to cancel order");
    } finally {
      setStatusUpdating(false);
    }
  };

  // Copy order ID
  const handleCopy = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success("Order ID copied to clipboard!", { duration: 1500 });
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "Placed":
      case "Confirmed":
        return <span className="badge badge-info badge-sm font-semibold">{status}</span>;
      case "Processing":
        return <span className="badge badge-warning badge-sm font-semibold">Processing</span>;
      case "Out for Delivery":
        return <span className="badge badge-secondary badge-sm font-semibold">Out for Delivery</span>;
      case "Delivered":
        return <span className="badge badge-success badge-sm font-semibold">Delivered</span>;
      case "Cancelled":
        return <span className="badge badge-error badge-sm font-semibold">Cancelled</span>;
      default:
        return <span className="badge badge-ghost badge-sm">{status || "Pending"}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-base-content">{title}</h1>
            <span className="badge badge-primary badge-sm font-mono">{filteredOrders.length}</span>
          </div>
          <p className="text-sm text-base-content/70 mt-0.5">{subtitle}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing || loading}
            className="btn btn-outline btn-sm gap-2"
            title="Refresh Orders"
          >
            <svg
              className={`w-4 h-4 ${refreshing ? "animate-spin text-primary" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          <Link
            href="/orders/pending"
            className={`btn btn-sm ${
              statusFilter === "Pending" ? "btn-warning" : "btn-outline"
            }`}
          >
            Pending ({stats.pending})
          </Link>
          <Link
            href="/orders/completed"
            className={`btn btn-sm ${
              statusFilter === "Delivered" ? "btn-success" : "btn-outline"
            }`}
          >
            Delivered ({stats.completed})
          </Link>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <div className="text-xs font-semibold text-base-content/60 uppercase">Total Orders</div>
          <div className="text-2xl font-black text-base-content mt-1">{stats.totalOrders}</div>
          <div className="text-xs text-base-content/50 mt-1">Direct from MongoDB API</div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <div className="text-xs font-semibold text-warning uppercase">Awaiting Action</div>
          <div className="text-2xl font-black text-warning mt-1">{stats.pending}</div>
          <div className="text-xs text-base-content/50 mt-1">Confirmed / Needs dispatch</div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <div className="text-xs font-semibold text-success uppercase">Fulfilled Orders</div>
          <div className="text-2xl font-black text-success mt-1">{stats.completed}</div>
          <div className="text-xs text-base-content/50 mt-1">Successfully delivered</div>
        </div>

        <div className="card bg-base-100 border border-base-300 p-4 shadow-sm">
          <div className="text-xs font-semibold text-primary uppercase">Total Sales</div>
          <div className="text-2xl font-black text-primary mt-1">
            ₹{stats.totalRevenue.toLocaleString("en-IN")}
          </div>
          <div className="text-xs text-base-content/50 mt-1">Active order revenue</div>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-base-200/60 p-1 rounded-xl">
            {[
              { id: "all", label: "All Orders", count: orders.length },
              { id: "Pending", label: "Pending", count: stats.pending },
              { id: "Processing", label: "In Delivery", count: stats.processing },
              { id: "Delivered", label: "Delivered", count: stats.completed },
              { id: "Cancelled", label: "Cancelled", count: stats.cancelled },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setStatusFilter(tab.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? "bg-primary text-primary-content font-bold shadow-xs"
                    : "text-base-content/70 hover:text-base-content hover:bg-base-300/40"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative flex-1 max-w-sm">
            <svg
              className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by order #, customer, phone..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="input input-sm input-bordered w-full pl-9 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-base-content/40 hover:text-base-content"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="card bg-base-100 shadow-sm border border-base-300 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full text-xs">
            <thead>
              <tr className="border-b border-base-300 bg-base-200/50 uppercase tracking-wider text-base-content/60 font-semibold">
                <th>Order Number</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Payment</th>
                <th>Total</th>
                <th>Date Placed</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [1, 2, 3, 4, 5].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td>
                      <div className="h-4 bg-base-300 rounded w-24"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-base-300 rounded w-32 mb-1"></div>
                      <div className="h-3 bg-base-300/60 rounded w-20"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-base-300 rounded w-28"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-base-300 rounded w-16"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-base-300 rounded w-16"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-base-300 rounded w-20"></div>
                    </td>
                    <td>
                      <div className="h-4 bg-base-300 rounded w-16"></div>
                    </td>
                    <td className="text-right">
                      <div className="h-6 bg-base-300 rounded w-16 ml-auto"></div>
                    </td>
                  </tr>
                ))
              ) : paginatedOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-base-content/60">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-14 h-14 rounded-2xl bg-base-200 flex items-center justify-center text-3xl mb-3 shadow-inner">
                        🛒
                      </div>
                      <h4 className="font-semibold text-base text-base-content">No Orders Found</h4>
                      <p className="text-xs text-base-content/60 mt-1">
                        {searchQuery
                          ? `No orders matching "${searchQuery}". Try a different keyword.`
                          : "No orders match the selected status category."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order) => {
                  const id = order._id || order.id;
                  const orderNum = order.orderNumber || id;
                  const customerName = order.shippingAddress?.fullName || "Guest Customer";
                  const phone = order.shippingAddress?.phone || "";
                  const itemCount = (order.items || []).reduce((acc, i) => acc + (i.quantity || 1), 0);
                  const firstItemName =
                    order.items?.[0]?.name ||
                    order.items?.[0]?.item?.serviceName ||
                    order.items?.[0]?.serviceName ||
                    "Item";
                  const total = order.summary?.grandTotal || 0;
                  const dateStr = order.createdAt
                    ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A";

                  return (
                    <tr key={id} className="hover:bg-base-200/40 transition-colors">
                      {/* Order Number */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleCopy(orderNum)}
                            className="font-mono font-bold text-primary hover:underline flex items-center gap-1 text-left"
                            title="Click to copy order number"
                          >
                            <span>{orderNum}</span>
                            <span className="text-[10px] text-base-content/40 hover:text-base-content">
                              {copiedId === orderNum ? "✓" : "📋"}
                            </span>
                          </button>
                        </div>
                      </td>

                      {/* Customer */}
                      <td>
                        <div className="font-medium text-base-content">{customerName}</div>
                        {phone && <div className="text-[11px] text-base-content/60 font-mono">{phone}</div>}
                      </td>

                      {/* Items */}
                      <td>
                        <div className="font-medium text-base-content truncate max-w-[180px]">
                          {firstItemName}
                          {order.items?.length > 1 && (
                            <span className="text-base-content/50 ml-1">
                              +{order.items.length - 1} more
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-base-content/60">
                          {itemCount} {itemCount === 1 ? "unit" : "units"}
                        </div>
                      </td>

                      {/* Payment */}
                      <td>
                        <span className="badge badge-ghost badge-sm font-medium">
                          {order.payment?.method || "COD"}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="font-mono font-bold text-base-content">
                        ₹{total.toLocaleString("en-IN")}
                      </td>

                      {/* Date */}
                      <td className="text-base-content/70 whitespace-nowrap">{dateStr}</td>

                      {/* Status */}
                      <td>{getStatusBadge(order.orderStatus)}</td>

                      {/* Action */}
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setSelectedOrder(order);
                              setIsDetailsOpen(true);
                            }}
                            className="btn btn-primary btn-xs"
                          >
                            Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <Pagination
            page={page}
            total={filteredOrders.length}
            limit={limit}
            onPageChange={setPage}
            onLimitChange={(l) => {
              setLimit(l);
              setPage(1);
            }}
            pageSizeOptions={[5, 10, 20, 50]}
            itemLabel="orders"
          />
        )}
      </div>

      {/* Order Details Modal */}
      {isDetailsOpen && selectedOrder && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-3xl p-6 border border-base-300 bg-base-100 shadow-2xl">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-base-200 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg text-base-content">
                    Order Details: {selectedOrder.orderNumber}
                  </h3>
                  {getStatusBadge(selectedOrder.orderStatus)}
                </div>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="btn btn-sm btn-circle btn-ghost"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto [scrollbar-width:thin]">
              {/* Status Update Quick Bar */}
              <div className="p-3 bg-base-200/60 rounded-xl flex flex-wrap items-center justify-between gap-3 border border-base-300/40">
                <span className="text-xs font-semibold text-base-content/80">Change Status:</span>
                <div className="flex flex-wrap items-center gap-1.5">
                  {["Confirmed", "Processing", "Out for Delivery", "Delivered"].map((st) => (
                    <button
                      key={st}
                      disabled={statusUpdating || selectedOrder.orderStatus === st || selectedOrder.orderStatus === "Cancelled"}
                      onClick={() => handleUpdateStatus(selectedOrder._id || selectedOrder.id, st)}
                      className={`btn btn-xs ${
                        selectedOrder.orderStatus === st ? "btn-primary" : "btn-outline"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                  {selectedOrder.orderStatus !== "Cancelled" && (
                    <button
                      disabled={statusUpdating}
                      onClick={() => setCancelModalOpen(true)}
                      className="btn btn-xs btn-error btn-outline"
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>

              {/* Customer & Shipping Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card bg-base-200/30 border border-base-200 p-4 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                    Customer Information
                  </h4>
                  <div className="text-sm font-semibold text-base-content">
                    {selectedOrder.shippingAddress?.fullName || "Guest Customer"}
                  </div>
                  <div className="text-xs text-base-content/70 mt-1">
                    Phone: {selectedOrder.shippingAddress?.phone || "N/A"}
                  </div>
                  {selectedOrder.shippingAddress?.email && (
                    <div className="text-xs text-base-content/70">
                      Email: {selectedOrder.shippingAddress.email}
                    </div>
                  )}
                  {selectedOrder.guestId && (
                    <div className="text-[10px] text-base-content/50 font-mono mt-1">
                      Guest ID: {selectedOrder.guestId}
                    </div>
                  )}
                </div>

                <div className="card bg-base-200/30 border border-base-200 p-4 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                    Delivery Address
                  </h4>
                  <div className="text-xs text-base-content/80 leading-relaxed">
                    {selectedOrder.shippingAddress?.street}
                    {selectedOrder.shippingAddress?.landmark && (
                      <span className="block text-base-content/60">
                        Landmark: {selectedOrder.shippingAddress.landmark}
                      </span>
                    )}
                    <span className="block font-medium">
                      {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state} -{" "}
                      {selectedOrder.shippingAddress?.postalCode}
                    </span>
                    <span className="block text-base-content/60">
                      {selectedOrder.shippingAddress?.country || "India"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                  Order Items ({selectedOrder.items?.length || 0})
                </h4>
                <div className="border border-base-200 rounded-xl overflow-hidden">
                  <table className="table table-sm w-full text-xs">
                    <thead className="bg-base-200/40">
                      <tr>
                        <th>Item Details</th>
                        <th>Type</th>
                        <th>Price</th>
                        <th>Qty</th>
                        <th className="text-right">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedOrder.items || []).map((i, idx) => {
                        const name = i.name || i.item?.serviceName || i.serviceName || "Product/Service";
                        const itemType = i.type || i.itemType || i.item?.type || "item";
                        const price = i.price || 0;
                        const qty = i.quantity || 1;
                        const total = i.itemTotal || price * qty;

                        return (
                          <tr key={i._id || idx}>
                            <td>
                              <div className="font-semibold text-base-content">{name}</div>
                              {i.item?.warranty && (
                                <div className="text-[10px] text-base-content/50">
                                  Warranty: {i.item.warranty}
                                </div>
                              )}
                            </td>
                            <td>
                              <span className="badge badge-ghost badge-xs uppercase font-mono">
                                {itemType}
                              </span>
                            </td>
                            <td className="font-mono">₹{price.toLocaleString("en-IN")}</td>
                            <td className="font-mono font-bold">{qty}</td>
                            <td className="font-mono font-bold text-right">
                              ₹{total.toLocaleString("en-IN")}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Order Summary & Pricing */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Timeline */}
                <div className="card bg-base-200/30 border border-base-200 p-4 rounded-xl">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-2">
                    Order Timeline
                  </h4>
                  <div className="space-y-3">
                    {(selectedOrder.timeline || []).map((tl, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                        <div>
                          <div className="font-semibold text-base-content">{tl.status}</div>
                          <div className="text-[11px] text-base-content/60">
                            {new Date(tl.time).toLocaleString("en-IN")}
                          </div>
                          {tl.note && (
                            <div className="text-[11px] text-base-content/70 italic mt-0.5">
                              "{tl.note}"
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="card bg-base-200/40 border border-base-200 p-4 rounded-xl space-y-2 text-xs">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-base-content/60 mb-1">
                    Financial Summary
                  </h4>
                  <div className="flex justify-between text-base-content/70">
                    <span>Subtotal:</span>
                    <span className="font-mono font-medium">
                      ₹{(selectedOrder.summary?.subtotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Shipping Fee:</span>
                    <span className="font-mono font-medium">
                      {selectedOrder.summary?.shippingFee === 0
                        ? "FREE"
                        : `₹${(selectedOrder.summary?.shippingFee || 0).toLocaleString("en-IN")}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-base-content/70">
                    <span>Estimated Tax (GST):</span>
                    <span className="font-mono font-medium">
                      ₹{(selectedOrder.summary?.tax || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedOrder.summary?.discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Discount:</span>
                      <span className="font-mono font-medium">
                        -₹{selectedOrder.summary.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="border-t border-base-300 pt-2 flex justify-between font-bold text-sm text-base-content">
                    <span>Grand Total:</span>
                    <span className="font-mono text-primary text-base">
                      ₹{(selectedOrder.summary?.grandTotal || 0).toLocaleString("en-IN")}
                    </span>
                  </div>
                  <div className="pt-2 text-[11px] text-base-content/60 flex items-center justify-between">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-base-content">
                      {selectedOrder.payment?.method || "Cash On Delivery (COD)"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="modal-action border-t border-base-200 pt-4">
              <button
                onClick={() => setIsDetailsOpen(false)}
                className="btn btn-sm btn-ghost"
              >
                Close
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setIsDetailsOpen(false)}>close</button>
          </form>
        </dialog>
      )}

      {/* Cancel Order Confirmation Modal */}
      {cancelModalOpen && selectedOrder && (
        <dialog className="modal modal-open">
          <div className="modal-box max-w-md p-6 border border-base-300 bg-base-100 shadow-2xl">
            <h3 className="font-bold text-base text-error flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              Cancel Order {selectedOrder.orderNumber}
            </h3>
            <p className="text-xs text-base-content/70 mt-2">
              Are you sure you want to cancel this order? This action will set the status to Cancelled and record the cancellation in the order history.
            </p>

            <div className="mt-4">
              <label className="text-xs font-semibold text-base-content/80 block mb-1">
                Reason for Cancellation:
              </label>
              <textarea
                rows={3}
                className="textarea textarea-bordered w-full text-xs"
                placeholder="e.g. Customer requested cancellation, out of stock, duplicate order..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              />
            </div>

            <div className="modal-action mt-4">
              <button
                onClick={() => setCancelModalOpen(false)}
                disabled={statusUpdating}
                className="btn btn-sm btn-ghost"
              >
                Keep Order
              </button>
              <button
                onClick={handleCancelOrder}
                disabled={statusUpdating}
                className="btn btn-sm btn-error"
              >
                {statusUpdating ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
          <form method="dialog" className="modal-backdrop">
            <button onClick={() => setCancelModalOpen(false)}>close</button>
          </form>
        </dialog>
      )}
    </div>
  );
}
