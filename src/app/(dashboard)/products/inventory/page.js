"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { productService } from "../../../../../service/product/productService";

export default function InventoryPage() {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadInventory() {
      try {
        const res = await productService.read({ all: true });
        const items = Array.isArray(res) ? res : res?.data || [];
        setStockItems(items);
      } catch (err) {
        console.error("Failed to load inventory:", err);
        setStockItems([]);
      } finally {
        setLoading(false);
      }
    }
    loadInventory();
  }, []);

  const totalSKUs = stockItems.length;
  const lowStockCount = stockItems.filter(
    (item) => Number(item.stock) > 0 && Number(item.stock) <= 10
  ).length;
  const outOfStockCount = stockItems.filter(
    (item) => Number(item.stock) <= 0
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-base-content">Inventory & Stock</h1>
          <p className="text-sm text-base-content/70">Real-time warehouse inventory and stock monitoring.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/products" className="btn btn-outline btn-sm">Catalog</Link>
          <Link href="/products" className="btn btn-primary btn-sm">+ Add Stock</Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card bg-base-100 border border-base-300 shadow-sm p-4">
          <div className="text-xs text-base-content/60 font-semibold uppercase">Total SKUs</div>
          <div className="text-2xl font-bold mt-1">{totalSKUs}</div>
        </div>
        <div className="card bg-base-100 border border-warning/30 bg-warning/5 shadow-sm p-4">
          <div className="text-xs text-warning font-semibold uppercase">Low Stock Alerts (&le; 10)</div>
          <div className="text-2xl font-bold text-warning mt-1">{lowStockCount}</div>
        </div>
        <div className="card bg-base-100 border border-error/30 bg-error/5 shadow-sm p-4">
          <div className="text-xs text-error font-semibold uppercase">Out of Stock</div>
          <div className="text-2xl font-bold text-error mt-1">{outOfStockCount}</div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-300">
        <div className="card-body p-0 overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr className="border-b border-base-300 text-xs uppercase text-base-content/60">
                <th>SKU</th>
                <th>Item Name</th>
                <th>Current Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th className="text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12">
                    <span className="loading loading-spinner loading-md text-primary" />
                  </td>
                </tr>
              ) : stockItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-16 text-base-content/60">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-base-200 flex items-center justify-center text-2xl mb-3">
                        📦
                      </div>
                      <h4 className="font-semibold text-base text-base-content">No Inventory Items Found</h4>
                      <p className="text-xs text-base-content/60 mt-1">
                        Products added to the catalog will reflect here with live inventory levels.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                stockItems.map((item) => {
                  const stock = Number(item.stock) || 0;
                  const isOutOfStock = stock <= 0;
                  const isLowStock = stock > 0 && stock <= 10;

                  return (
                    <tr key={item._id || item.id}>
                      <td className="font-mono text-xs font-semibold">{item.sku || "N/A"}</td>
                      <td className="font-semibold text-base-content">
                        {item.serviceName || item.name || item.productName}
                      </td>
                      <td className="font-mono font-medium">{stock} units</td>
                      <td className="font-mono text-sm">₹{Number(item.price || 0).toLocaleString("en-IN")}</td>
                      <td>
                        <span
                          className={`badge badge-sm font-semibold ${
                            isOutOfStock
                              ? "badge-error"
                              : isLowStock
                              ? "badge-warning"
                              : "badge-success"
                          }`}
                        >
                          {isOutOfStock ? "Out of Stock" : isLowStock ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                      <td className="text-right">
                        <Link href="/products" className="btn btn-ghost btn-xs text-primary font-medium">
                          Manage
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
