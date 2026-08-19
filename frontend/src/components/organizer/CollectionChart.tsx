import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Area,
} from "recharts";
import type { CollectionTimeseries } from "../../types/dashboard";
import { formatNaira } from "../../lib/format";

interface CollectionChartProps {
  data: CollectionTimeseries;
  currency?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value?: number | string;
  }>;
  label?: string;
  currency?: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  currency = "NGN",
}: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  const value = Number(payload[0]?.value ?? 0);

  return (
    <div className="min-w-42.5 rounded-xl border border-(--border) bg-(--surface) px-4 py-3 shadow-lg">
      <p className="mb-1 text-xs font-medium text-(--text-muted)">
        {label}
      </p>

      <p className="text-base font-semibold tracking-tight text-(--text-primary)">
        {formatNaira(value, currency)}
      </p>
    </div>
  );
}

export function CollectionChart({
  data,
  currency = "NGN",
}: CollectionChartProps) {
  const chartData = data.series.map((point) => ({
    ...point,
    label: new Date(point.date).toLocaleDateString("en-NG", {
      month: "short",
      day: "numeric",
    }),
  }));

  const lastValue =
    chartData[chartData.length - 1]?.cumulativeAmount ?? 0;

  const target = data.target ?? 0;

  const percentComplete =
    target > 0 ? Math.round((lastValue / target) * 100) : 0;

  const remaining = Math.max(target - lastValue, 0);

  const formattedCurrent = formatNaira(lastValue, currency);
  const formattedTarget = formatNaira(target, currency);

  return (
    <div className="rounded-2xl border border-(--border) bg-(--surface) p-5 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-display text-lg font-semibold text-(--text-primary)">
              Collection Progress
            </h3>

            <span className="rounded-full bg-(--primary)/10 px-2 py-0.5 text-[11px] font-semibold text-(--primary)">
              {percentComplete}%
            </span>
          </div>

          <p className="mt-1 text-sm text-(--text-muted)">
            Cumulative amount collected over time
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs font-medium text-(--text-muted)">
            Collected
          </p>

          <p className="mt-0.5 text-xl font-semibold tracking-tight text-(--text-primary)">
            {formattedCurrent}
          </p>

          {target > 0 && (
            <p className="mt-0.5 text-xs text-(--text-muted)">
              of {formattedTarget} target
            </p>
          )}
        </div>
      </div>

      {/* Progress summary */}
      {target > 0 && (
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <span className="text-(--text-muted)">Progress</span>

            <span className="font-medium text-(--text-primary)">
              {percentComplete}%
            </span>
          </div>

          <div className="h-1.5 overflow-hidden rounded-full bg-(--border)">
            <div
              className="h-full rounded-full bg-(--primary) transition-all duration-500"
              style={{
                width: `${Math.min(percentComplete, 100)}%`,
              }}
            />
          </div>

          <div className="mt-2 flex justify-between text-xs">
            <span className="text-(--text-muted)">
              {formattedCurrent} collected
            </span>

            <span className="text-(--text-muted)">
              {remaining > 0
                ? `${formatNaira(remaining, currency)} remaining`
                : "Target reached"}
            </span>
          </div>
        </div>
      )}

      {/* Chart */}
      <div className="mt-6 h-70 w-full">
        {chartData.length > 0 ? (
          <ResponsiveContainer
            width="100%"
            height="100%"
            debounce={0}
          >
            <ComposedChart
              data={chartData}
              margin={{
                top: 12,
                right: 8,
                left: 0,
                bottom: 4,
              }}
            >
              <defs>
                <linearGradient
                  id="collectionAreaGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor="var(--primary)"
                    stopOpacity={0.12}
                  />

                  <stop
                    offset="100%"
                    stopColor="var(--primary)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                stroke="var(--border)"
                strokeDasharray="4 4"
                vertical={false}
                opacity={0.45}
              />

              <XAxis
                dataKey="label"
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                dy={10}
                tickMargin={4}
              />

              <YAxis
                stroke="var(--text-muted)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                width={58}
                tickFormatter={(value: number) => {
                  if (value >= 1_000_000) {
                    return `₦${(value / 1_000_000).toFixed(1)}M`;
                  }

                  if (value >= 1_000) {
                    return `₦${(value / 1_000).toFixed(0)}K`;
                  }

                  return `₦${value}`;
                }}
              />

              <Tooltip
                cursor={{
                  stroke: "var(--border)",
                  strokeWidth: 1,
                }}
                content={
                  <CustomTooltip
                    currency={currency}
                  />
                }
              />

              {target > 0 && (
                <ReferenceLine
                  y={target}
                  stroke="var(--accent)"
                  strokeDasharray="5 5"
                  strokeWidth={1}
                  label={{
                    value: `Target ${formattedTarget}`,
                    position: "insideTopRight",
                    fill: "var(--accent)",
                    fontSize: 11,
                  }}
                />
              )}

              <Area
                type="monotone"
                dataKey="cumulativeAmount"
                stroke="none"
                fill="url(#collectionAreaGradient)"
                fillOpacity={1}
                isAnimationActive
              />

              <Line
                type="monotone"
                dataKey="cumulativeAmount"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "var(--primary)",
                  stroke: "var(--surface)",
                  strokeWidth: 2,
                }}
                isAnimationActive
              />
            </ComposedChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-(--border)">
            <div className="text-center">
              <p className="text-sm font-medium text-(--text-primary)">
                No collection data yet
              </p>

              <p className="mt-1 text-xs text-(--text-muted)">
                Collection activity will appear here once payments are made.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}