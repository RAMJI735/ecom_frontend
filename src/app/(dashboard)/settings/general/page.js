"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { settingsService } from "../../../../../service/settings/settingsService";

export default function GeneralSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [currency, setCurrency] = useState("INR");
  const [taxRate, setTaxRate] = useState(18);
  const [freeDeliveryThreshold, setFreeDeliveryThreshold] = useState(2000);
  const [standardDeliveryFee, setStandardDeliveryFee] = useState(150);

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
          if (data.commerce) {
            setCurrency(data.commerce.currency || "INR");
            setTaxRate(data.commerce.taxRate ?? 18);
            setFreeDeliveryThreshold(data.commerce.freeDeliveryThreshold ?? 2000);
            setStandardDeliveryFee(data.commerce.standardDeliveryFee ?? 150);
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
        commerce: {
          currency,
          taxRate: Number(taxRate),
          freeDeliveryThreshold: Number(freeDeliveryThreshold),
          standardDeliveryFee: Number(standardDeliveryFee),
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

          {/* Shipping & Delivery Rules */}
          <div className="border-t border-base-200 pt-4">
            <h3 className="font-semibold text-sm text-base-content uppercase tracking-wider mb-3">
              Delivery & Order Thresholds
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Free Delivery Above (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full"
                  value={freeDeliveryThreshold}
                  onChange={(e) => setFreeDeliveryThreshold(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Orders at or above this amount receive free delivery in the app.
                  </span>
                </label>
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Standard Delivery Charge (₹)</span>
                </label>
                <input
                  type="number"
                  min="0"
                  className="input input-bordered w-full"
                  value={standardDeliveryFee}
                  onChange={(e) => setStandardDeliveryFee(e.target.value)}
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Applied when cart value is below free delivery threshold.
                  </span>
                </label>
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
