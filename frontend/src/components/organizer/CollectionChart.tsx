import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import type { CollectionTimeseries } from "../../types/dashboard";
import { formatNaira } from "../../lib/format";

interface CollectionChartProps {
  data: CollectionTimeseries;
  currency?: string;
}

export function CollectionChart({ data, currency = "NGN" }: CollectionChartProps) {
  const chartData = data.series.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString("en-NG", { month: "short", day: "numeric" }),
  }));

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5">
      <h3 className="font-display text-lg text-(--text-primary) mb-4">Collection Progress</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="collectedFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="label" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis
            stroke="var(--text-muted)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`}
          />
          <Tooltip
            formatter={(value) => formatNaira(Number(value ?? 0), currency)}
            contentStyle={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              color: "var(--text-primary)",
            }}
          />
          <ReferenceLine
            y={data.target}
            stroke="var(--accent)"
            strokeDasharray="6 4"
            label={{
              value: `Target ${formatNaira(data.target, currency)}`,
              position: "insideTopRight",
              fill: "var(--accent)",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="cumulativeAmount"
            stroke="var(--primary)"
            strokeWidth={2}
            fill="url(#collectedFill)"
            dot={{ r: 3, fill: "var(--primary)" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}