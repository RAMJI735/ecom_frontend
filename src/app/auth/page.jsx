"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@context/authContext";
import toast from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [data, setData] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, register } = useAuth();

  const handle = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
    if (error) setError("");
  };

  const CallApi = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let res;
      if (isLogin) {
        res = await login({ email: data.email, password: data.password });
      } else {
        res = await register(data);
      }

      if (!res.success) {
        setError(res.message || "Authentication failed");
        toast.error(res.message || "Authentication failed");
        return;
      }

      toast.success(res.message || (isLogin ? "Login Successful!" : "Account created successfully!"));
      setTimeout(() => {
        window.location.href = "/";
      }, 500);

    } catch (err) {
      const msg = "An unexpected error occurred. Please try again.";
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md bg-base-100 shadow-xl border border-base-300">
      <div className="card-body">
        <h2 className="card-title text-2xl font-bold justify-center mb-2">
          {isLogin ? "Sign In" : "Register Account"}
        </h2>
        <p className="text-center text-sm text-base-content/60 mb-4">
          ElectroCare Technical & E-Commerce Portal
        </p>

        {error && (
          <div className="alert alert-error text-sm py-2 px-3 mb-2 shadow-sm">
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={CallApi} className="space-y-4">
          {!isLogin && (
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Full Name</span>
              </label>
              <input
                type="text"
                name="name"
                value={data.name}
                placeholder="John Doe"
                className="input input-bordered w-full"
                required={!isLogin}
                onChange={handle}
              />
            </div>
          )}

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              name="email"
              value={data.email}
              placeholder="user@example.com"
              className="input input-bordered w-full"
              required
              onChange={handle}
            />
          </div>

          <div className="form-control">
            <label className="label">
              <span className="label-text font-semibold">Password</span>
            </label>
            <input
              type="password"
              name="password"
              value={data.password}
              placeholder="••••••••"
              className="input input-bordered w-full"
              required
              onChange={handle}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary w-full mt-2"
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : isLogin ? (
              "Log In"
            ) : (
              "Sign Up"
            )}
          </button>
        </form>

        <div className="divider my-2">OR</div>

        <div className="text-center text-sm">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
            className="link link-primary font-semibold"
          >
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      </div>
    </div>
  );
}
