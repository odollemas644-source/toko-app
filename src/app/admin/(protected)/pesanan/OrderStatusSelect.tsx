"use client";

import { useState, useTransition } from "react";
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

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: string;
  status: Order["status"];
}) {
  const [value, setValue] = useState(status);
  const [, startTransition] = useTransition();

  return (
    <select
      value={value}
      onChange={(e) => {
        const next = e.target.value as Order["status"];
        setValue(next);
        startTransition(() => updateOrderStatus(orderId, next));
      }}
      className="text-xs font-semibold rounded-full px-2.5 py-1 border outline-none shrink-0"
      style={{ borderColor: "var(--border)" }}
    >
      {OPTIONS.map((o) => (
        <option key={o} value={o}>{LABEL[o]}</option>
      ))}
    </select>
  );
}
