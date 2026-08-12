"use client";

import { useEffect, useState, useTransition } from "react";
import { Check } from "lucide-react";
import { updateOrderStatus } from "@/app/actions/admin-misc";
import type { Order } from "@/lib/types";

const OPTIONS: Order["status"][] = ["pending", "diproses", "dikirim", "selesai", "dibatalkan"];
const LABEL: Record<Order["status"], string> = {
  pending: "Menunggu",
  diproses: "Diproses",
  dikirim: "Dikirim",
  selesai: "Selesai",
  dibatalkan: "Dibatalkan",
};

function formatWaktu(iso: string) {
  const d = new Date(iso);
  const tanggal = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
  const jam = d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return `${tanggal}, ${jam}`;
}

export default function OrderStatusSelect({
  orderId,
  status,
  statusUpdatedAt,
}: {
  orderId: string;
  status: Order["status"];
  statusUpdatedAt: string;
}) {
  const [value, setValue] = useState(status);
  const [updatedAt, setUpdatedAt] = useState(statusUpdatedAt);
  const [showSaved, setShowSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!showSaved) return;
    const t = setTimeout(() => setShowSaved(false), 2000);
    return () => clearTimeout(t);
  }, [showSaved]);

  function handleChange(next: Order["status"]) {
    setValue(next);
    const now = new Date().toISOString();
    startTransition(async () => {
      await updateOrderStatus(orderId, next);
      setUpdatedAt(now);
      setShowSaved(true);
    });
  }

  return (
    <div className="flex flex-col items-end gap-1 shrink-0">
      <div className="flex items-center gap-1.5">
        {showSaved && (
          <span
            className="flex items-center gap-0.5 text-[10px] font-semibold"
            style={{ color: "var(--primary)" }}
          >
            <Check className="w-3 h-3" /> Tersimpan
          </span>
        )}
        <select
          value={value}
          disabled={isPending}
          onChange={(e) => handleChange(e.target.value as Order["status"])}
          className="text-xs font-semibold rounded-full px-2.5 py-1 border outline-none disabled:opacity-50"
          style={{ borderColor: "var(--border)" }}
        >
          {OPTIONS.map((o) => (
            <option key={o} value={o}>{LABEL[o]}</option>
          ))}
        </select>
      </div>
      <span className="text-[10px]" style={{ color: "var(--ink-muted)" }}>
        {LABEL[value]} sejak {formatWaktu(updatedAt)}
      </span>
    </div>
  );
}
