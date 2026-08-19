import type { ReactNode } from "react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  trend?: { value: string; positive: boolean };
  subtext?: string;
}

export function StatCard({ label, value, icon, trend, subtext }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-(--text-muted)">{label}</span>
        {icon && <span className="text-(--primary)">{icon}</span>}
      </div>
      <div className="font-numeric text-2xl text-(--text-primary)">{value}</div>
      {trend && (
        <p className="text-xs mt-1 font-medium" style={{ color: trend.positive ? "var(--primary)" : "#B3492F" }}>
          {trend.positive ? "↑" : "↓"} {trend.value}
        </p>
      )}
      {subtext && <p className="text-xs text-(--text-muted) mt-1">{subtext}</p>}
    </div>
  );
}