"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, ClipboardList } from "lucide-react";
import { useCart } from "@/lib/cart-store";

const NAV = [
  { href: "/", label: "Home", icon: Home },
  { href: "/cari", label: "Cari", icon: Search },
  { href: "/keranjang", label: "Keranjang", icon: ShoppingCart },
  { href: "/pesanan", label: "Pesanan", icon: ClipboardList },
];

export default function BottomNav() {
  const pathname = usePathname();
  const { totalItems } = useCart();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t flex justify-around py-2"
      style={{ borderColor: "var(--border)" }}
    >
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 relative"
          >
            <Icon
              className="w-5 h-5"
              style={{ color: active ? "var(--primary)" : "var(--ink-muted)" }}
            />
            {href === "/keranjang" && totalItems > 0 && (
              <span
                className="absolute -top-0.5 right-1.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                style={{ background: "var(--price)" }}
              >
                {totalItems}
              </span>
            )}
            <span
              className="text-[11px] font-medium"
              style={{ color: active ? "var(--primary)" : "var(--ink-muted)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
