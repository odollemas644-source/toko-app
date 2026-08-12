function formatRpShort(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `${Math.round(n / 1000)}rb`;
  return `${n}`;
}

export default function SalesBarChart({
  data,
}: {
  data: { label: string; value: number }[];
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-36 px-1">
      {data.map((d, idx) => {
        const heightPct = Math.max((d.value / max) * 100, d.value > 0 ? 6 : 2);
        return (
          <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
            {d.value > 0 && (
              <span className="text-[10px] font-semibold" style={{ color: "var(--ink-muted)" }}>
                {formatRpShort(d.value)}
              </span>
            )}
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${heightPct}%`,
                background: d.value > 0 ? "var(--primary)" : "var(--sage)",
                minHeight: 4,
              }}
            />
            <span className="text-[10px] font-medium" style={{ color: "var(--ink-muted)" }}>
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
