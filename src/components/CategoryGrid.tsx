import Link from "next/link";
import type { Category } from "@/lib/types";

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  if (categories.length === 0) return null;

  return (
    <div className="grid grid-cols-4 gap-y-4 px-4 py-5">
      {categories.map((c) => (
        <Link
          key={c.id}
          href={`/kategori/${c.slug}`}
          className="flex flex-col items-center gap-1.5 text-center"
        >
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-2xl"
            style={{ background: "var(--sage)" }}
          >
            {c.icon || "🛒"}
          </div>
          <span className="text-[11px] font-medium leading-tight" style={{ color: "var(--ink)" }}>
            {c.name}
          </span>
        </Link>
      ))}
    </div>
  );
}
