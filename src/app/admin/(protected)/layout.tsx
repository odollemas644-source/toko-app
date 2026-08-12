import Link from "next/link";
import { LayoutDashboard, Package, ClipboardList, Tag, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/app/actions/auth";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/produk", label: "Produk", icon: Package },
  { href: "/admin/kategori", label: "Kategori", icon: Tag },
  { href: "/admin/pesanan", label: "Pesanan", icon: ClipboardList },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen flex" style={{ background: "var(--background)" }}>
      <aside
        className="w-56 shrink-0 border-r flex flex-col p-4 hidden sm:flex"
        style={{ borderColor: "var(--border)" }}
      >
        <h1 className="font-display font-bold text-lg mb-1">Admin Toko</h1>
        <p className="text-xs mb-6 truncate" style={{ color: "var(--ink-muted)" }}>
          {user?.email}
        </p>
        <nav className="flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-black/5"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          ))}
        </nav>
        <form action={logout} className="mt-auto">
          <button
            type="submit"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-black/5 w-full"
            style={{ color: "var(--price)" }}
          >
            <LogOut className="w-4 h-4" />
            Keluar
          </button>
        </form>
      </aside>

      {/* Mobile top bar */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b flex items-center justify-between px-4 py-3" style={{ borderColor: "var(--border)" }}>
        <span className="font-display font-bold">Admin Toko</span>
        <form action={logout}>
          <button type="submit" style={{ color: "var(--price)" }}>
            <LogOut className="w-5 h-5" />
          </button>
        </form>
      </div>
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t flex justify-around py-2"
        style={{ borderColor: "var(--border)" }}
      >
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2 py-1">
            <Icon className="w-5 h-5" style={{ color: "var(--primary)" }} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 p-4 sm:p-8 pt-16 sm:pt-8 pb-20 sm:pb-8 max-w-4xl">
        {children}
      </main>
    </div>
  );
}
