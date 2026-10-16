"use client";

import { useState } from "react";

export default function GeneralSettingsPage() {
  const [currency, setCurrency] = useState("USD");
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [smsAlerts, setSmsAlerts] = useState(true);

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">General Settings</h1>
        <p className="text-sm text-base-content/70">Configure system defaults, currency, and operational preferences.</p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-6">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Store Currency</span>
            </label>
            <select
              className="select select-bordered w-full max-w-xs"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            >
              <option value="USD">USD ($) - US Dollar</option>
              <option value="EUR">EUR (€) - Euro</option>
              <option value="INR">INR (₹) - Indian Rupee</option>
              <option value="GBP">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="border-t border-base-200 pt-4 space-y-4">
            <h3 className="font-semibold text-sm">Notification Channels</h3>

            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm">Email Notifications</div>
                <div className="text-xs text-base-content/60">Receive email alerts for new customer service requests</div>
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
                <div className="text-xs text-base-content/60">Send SMS to technicians when tickets are assigned</div>
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
            <button className="btn btn-primary btn-sm">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}
