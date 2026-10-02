"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type ChartPoint = { label: string; revenue: number; orders: number };

export default function SalesChart({
  data,
  days = 30,
}: {
  data: ChartPoint[];
  days?: number;
}) {
  const hasRevenue = data.some((d) => d.revenue > 0);

  if (!hasRevenue) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-ink/15 text-sm text-ink-soft">
        No sales in the last {days} days.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#18181b" stopOpacity={0.25} />
              <stop offset="100%" stopColor="#18181b" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "#71717a" }}
            tickLine={false}
            axisLine={false}
            width={44}
          />
          <Tooltip
            formatter={(value, name) =>
              name === "revenue"
                ? [`$${Number(value ?? 0).toFixed(2)}`, "Revenue"]
                : [Number(value ?? 0), "Orders"]
            }
            labelStyle={{ fontWeight: 600 }}
            contentStyle={{ borderRadius: 8, border: "1px solid #e4e4e7", fontSize: 12 }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#18181b"
            strokeWidth={2}
            fill="url(#revenueFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
