"use client";

import { useState } from "react";

export default function StoreProfilePage() {
  const [store, setStore] = useState({
    name: "ElectroCare Support & Services",
    email: "support@electrocare.com",
    phone: "+1 (800) 555-0199",
    address: "742 Evergreen Terrace, Suite 100",
    city: "Springfield",
    zip: "97477",
  });

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-base-content">Store Profile</h1>
        <p className="text-sm text-base-content/70">Public business details, contact information, and billing address.</p>
      </div>

      <div className="card bg-base-100 border border-base-300 shadow-sm">
        <div className="card-body space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Store / Company Name</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={store.name}
              onChange={(e) => setStore({ ...store, name: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Support Email</span>
              </label>
              <input
                type="email"
                className="input input-bordered w-full"
                value={store.email}
                onChange={(e) => setStore({ ...store, email: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Support Phone</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={store.phone}
                onChange={(e) => setStore({ ...store, phone: e.target.value })}
              />
            </div>
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Office Address</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full"
              value={store.address}
              onChange={(e) => setStore({ ...store, address: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">City</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={store.city}
                onChange={(e) => setStore({ ...store, city: e.target.value })}
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Zip / Postal Code</span>
              </label>
              <input
                type="text"
                className="input input-bordered w-full"
                value={store.zip}
                onChange={(e) => setStore({ ...store, zip: e.target.value })}
              />
            </div>
          </div>

          <div className="card-actions justify-end pt-2">
            <button className="btn btn-primary btn-sm">Update Profile</button>
          </div>
        </div>
      </div>
    </div>
  );
}
