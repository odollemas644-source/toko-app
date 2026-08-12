"use client";

import { useState } from "react";
import { login } from "@/app/actions/auth";

export default function AdminLoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: "var(--background)" }}
    >
      <div className="w-full max-w-sm">
        <h1 className="font-display font-bold text-2xl mb-1 text-center">Admin Toko</h1>
        <p className="text-sm text-center mb-6" style={{ color: "var(--ink-muted)" }}>
          Masuk untuk kelola produk & pesanan
        </p>
        <form action={handleSubmit} className="flex flex-col gap-3">
          <input
            name="email"
            type="email"
            required
            placeholder="Email"
            className="rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
          <input
            name="password"
            type="password"
            required
            placeholder="Password"
            className="rounded-xl border px-3 py-2.5 text-sm outline-none"
            style={{ borderColor: "var(--border)" }}
          />
          {error && (
            <p className="text-sm rounded-lg px-3 py-2" style={{ background: "#FDECEC", color: "var(--price)" }}>
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="rounded-full py-3 text-white font-semibold text-sm disabled:opacity-50 mt-2"
            style={{ background: "var(--primary)" }}
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>
        </form>
      </div>
    </div>
  );
}
