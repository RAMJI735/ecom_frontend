"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import api from "../service/api";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Read stored user and token on client mount
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
      // Ensure cookie is in sync for proxy.js server checks
      document.cookie = `token=${savedToken}; path=/; max-age=604800; SameSite=Lax`;
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        setUser(null);
      }
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await api.post("/login/user", credentials);
      const result = response.data;
      const receivedToken = result.token;

      if (response.status === 200 || result.success || receivedToken) {
        const userData = result.data || { email: credentials.email };
        setUser(userData);
        localStorage.setItem("user", JSON.stringify(userData));

        if (receivedToken) {
          setToken(receivedToken);
          localStorage.setItem("token", receivedToken);
          // Set cookie for Next.js proxy.js
          document.cookie = `token=${receivedToken}; path=/; max-age=604800; SameSite=Lax`;
        }

        return {
          success: true,
          message: result.message || "Logged in successfully",
        };
      } else {
        return {
          success: false,
          message: result.message || "Invalid email or password",
        };
      }
    } catch (err) {
      console.error("Login axios error:", err);
      const message =
        err.response?.data?.message ||
        (err.request
          ? "Failed to connect to backend server on port 8000. Is it running?"
          : "An unexpected error occurred during login.");
      return {
        success: false,
        message,
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await api.post("/signup/user", {
        name: userData.name,
        email: userData.email,
        password: userData.password,
        phone: userData.phone || "",
      });

      const result = response.data;

      if (response.status === 201 || result.message === "User created successfully") {
        // Auto-login after successful registration
        return await login({ email: userData.email, password: userData.password });
      } else {
        return {
          success: false,
          message: result.message || "Registration failed.",
        };
      }
    } catch (err) {
      console.error("Register axios error:", err);
      const message =
        err.response?.data?.message ||
        (err.request
          ? "Failed to connect to backend server on port 8000. Is it running?"
          : "An unexpected error occurred during registration.");
      return {
        success: false,
        message,
      };
    }
  };

  const logout = async () => {
    try {
      const res = await api.post("/logout/user");
      if (res.status === 200 || res.data.success) {
        toast.success(res.data.message || "Logged out successfully");
      } else {
        toast.error(res.data.message || "Logout failed");
      }
    } catch (err) {
      console.error("Logout error:", err);
      const message =
        err.response?.data?.message ||
        (err.request
          ? "Failed to connect to backend server on port 8000. Is it running?"
          : "An unexpected error occurred during logout.");
      toast.error(message);
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      // Expire client-side cookie if set
      document.cookie = "token=; path=/; max-age=0; SameSite=Lax";
      window.location.href = "/auth";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
