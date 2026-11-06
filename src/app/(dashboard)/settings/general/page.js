"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { settingsService } from "../../../../../service/settings/settingsService";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currency, setCurrency] = useState("INR");
  const [taxRate, setTaxRate] = useState(18);

  // Delivery Cost & Threshold Settings
  const [deliveryCharges, setDeliveryCharges] = useState(false);
  const [minPrice, setMinPrice] = useState(100);
  const [deliveryCost, setDeliveryCost] = useState(50);

  const [announcementText, setAnnouncementText] = useState("");
  const [announcementEnabled, setAnnouncementEnabled] = useState(true);

  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await settingsService.get();
        if (data) {
          const dc = data.deliveryCharges !== undefined
            ? Boolean(data.deliveryCharges)
            : (data.commerce?.deliveryCharges !== undefined ? Boolean(data.commerce.deliveryCharges) : false);

          const mp = data.minPrice !== undefined
            ? Number(data.minPrice)
            : (data.commerce?.minPrice !== undefined
                ? Number(data.commerce.minPrice)
                : Number(data.commerce?.freeDeliveryThreshold ?? 100));

          const dCost = data.delivery_cost !== undefined
            ? Number(data.delivery_cost)
            : (data.commerce?.delivery_cost !== undefined
                ? Number(data.commerce.delivery_cost)
                : Number(data.commerce?.standardDeliveryFee ?? 50));

          setDeliveryCharges(dc);
          setMinPrice(mp);
          setDeliveryCost(dCost);

          if (data.commerce) {
            setCurrency(data.commerce.currency || "INR");
            setTaxRate(data.commerce.taxRate ?? 18);
          }
          if (data.announcement) {
            setAnnouncementText(data.announcement.text || "");
            setAnnouncementEnabled(data.announcement.enabled ?? true);
          }
          if (data.notifications) {
            setEmailAlerts(data.notifications.emailAlerts ?? true);
            setSmsAlerts(data.notifications.smsAlerts ?? true);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
        toast.error("Could not load current settings");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await settingsService.update({
        deliveryCharges,
        minPrice: Number(minPrice),
        delivery_cost: Number(deliveryCost),
        commerce: {
          deliveryCharges,
          minPrice: Number(minPrice),
          delivery_cost: Number(deliveryCost),
          freeDeliveryThreshold: Number(minPrice),
          standardDeliveryFee: Number(deliveryCost),
          currency,
          taxRate: Number(taxRate),
          currencySymbol: currency === "INR" ? "₹" : currency === "USD" ? "$" : currency === "EUR" ? "€" : "£",
        },
        announcement: {
          text: announcementText,
          enabled: announcementEnabled,
          type: "live",
        },
        notifications: {
          emailAlerts,
          smsAlerts,
        },
      });
      toast.success("Settings saved successfully!");
    } catch (err) {
      console.error("Save settings failed:", err);
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">General Settings</h1>
        <p className="text-sm text-base-content/70">
          Configure financial rules, free shipping thresholds, app announcement tickers, and operational defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-6">
          {/* Currency & Tax */}
          <div>
            <h3 className="font-semibold text-sm text-base-content uppercase tracking-wider mb-3">
              Currency & Taxation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Store Currency</span>
                </label>
                <select
                  className="select select-bordered w-full"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Default GST / Tax Rate (%)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  className="input input-bordered w-full"
                  value={taxRate}
                  onChange={(e) => setTaxRate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Delivery Cost & Rules Section */}
          <div className="border-t border-base-200 pt-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-semibold text-sm text-base-content uppercase tracking-wider flex items-center gap-2">
                  <span>🚚 Delivery Cost & Charges</span>
                  <span
                    className={`badge badge-sm font-semibold ${
                      deliveryCharges ? "badge-success text-white" : "badge-ghost opacity-60"
                    }`}
                  >
                    {deliveryCharges ? "Enabled" : "Disabled (Free Delivery)"}
                  </span>
                </h3>
                <p className="text-xs text-base-content/60 mt-0.5">
                  Configure whether delivery fees apply to customer orders and set the minimum order price threshold.
                </p>
              </div>

              {/* Toggle key: deliveryCharges (true / false) */}
              <div className="flex items-center gap-3 bg-base-200/60 px-3 py-2 rounded-xl border border-base-300 shrink-0">
                <span className="text-xs font-semibold text-base-content">
                  Apply Delivery Charges
                </span>
                <input
                  type="checkbox"
                  className="toggle toggle-primary toggle-sm"
                  checked={deliveryCharges}
                  onChange={(e) => setDeliveryCharges(e.target.checked)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* minPrice */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content">
                    Minimum Order Price for Free Delivery (₹) <span className="text-primary font-mono">(minPrice)</span>
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-base-content/50 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered w-full pl-8 input-sm sm:input-md font-mono"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="100"
                  />
                </div>
                <label className="label py-1">
                  <span className="label-text-alt text-base-content/60">
                    If order total is less than this amount, delivery charges will be added.
                  </span>
                </label>
              </div>

              {/* delivery_cost */}
              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text font-semibold text-xs text-base-content">
                    Delivery Cost Amount (₹) <span className="text-primary font-mono">(delivery_cost)</span>
                  </span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-base-content/50 font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="0"
                    className="input input-bordered w-full pl-8 input-sm sm:input-md font-mono"
                    value={deliveryCost}
                    onChange={(e) => setDeliveryCost(e.target.value)}
                    placeholder="50"
                  />
                </div>
                <label className="label py-1">
                  <span className="label-text-alt text-base-content/60">
                    The delivery fee charged to the customer if the order total is below ₹{minPrice}.
                  </span>
                </label>
              </div>
            </div>

            {/* Real-time Business Logic Explanation Box */}
            <div
              className={`p-3.5 rounded-xl border text-xs leading-relaxed flex items-start gap-3 transition-colors ${
                deliveryCharges
                  ? "bg-primary/5 border-primary/20 text-base-content"
                  : "bg-success/5 border-success/20 text-success"
              }`}
            >
              <div className="text-lg shrink-0 mt-0.5">
                {deliveryCharges ? "📦" : "✨"}
              </div>
              <div>
                <span className="font-bold block mb-0.5">
                  {deliveryCharges ? "Delivery Fee Active Condition:" : "Free Delivery for All Customers:"}
                </span>
                {deliveryCharges ? (
                  <span>
                    When customer checkout subtotal is <strong>less than ₹{minPrice}</strong>, a delivery charge of{" "}
                    <strong className="text-primary font-mono">₹{deliveryCost}</strong> will be added on the backend.
                    Orders with subtotal <strong>≥ ₹{minPrice}</strong> receive <strong>FREE Delivery</strong> (₹0).
                  </span>
                ) : (
                  <span>
                    Delivery charges are currently <strong>disabled</strong> (<code className="font-mono">deliveryCharges: false</code>).
                    All customer orders receive <strong>FREE Delivery (₹0)</strong> regardless of order total.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Live Announcement Banner */}
          <div className="border-t border-base-200 pt-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm text-base-content uppercase tracking-wider">
                  Mobile App Top Live Banner
                </h3>
                <p className="text-xs text-base-content/60">
                  Displayed as the real-time status pill or announcement ticker across the mobile app.
                </p>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={announcementEnabled}
                onChange={(e) => setAnnouncementEnabled(e.target.checked)}
              />
            </div>

            <div className="form-control">
              <input
                type="text"
                placeholder="e.g. ⚡ NEXT-DAY DISPATCH • SITE DELIVERY AVAILABLE FOR ALL CONTRACTORS"
                className="input input-bordered w-full"
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
              />
            </div>
          </div>

          {/* Notifications */}
          <div className="border-t border-base-200 pt-4 space-y-4">
            <h3 className="font-semibold text-sm text-base-content uppercase tracking-wider">
              Notification Channels
            </h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Email Notifications</div>
                <div className="text-xs text-base-content/60">Receive email alerts for new customer service requests & orders</div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={emailAlerts}
                onChange={(e) => setEmailAlerts(e.target.checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">SMS Alerts to Technicians</div>
                <div className="text-xs text-base-content/60">Send automated dispatch SMS when service requests are assigned</div>
              </div>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={smsAlerts}
                onChange={(e) => setSmsAlerts(e.target.checked)}
              />
            </div>
          </div>

          <div className="card-actions justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-sm px-6"
            >
              {saving ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
