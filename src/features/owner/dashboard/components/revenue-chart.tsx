"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { RevenueByProperty } from "../types";

type RevenueChartProps = {
  data: RevenueByProperty[];
};

export function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data.map((item) => ({
    name: item.title.length > 14 ? `${item.title.slice(0, 14)}…` : item.title,
    revenue: item.monthlyRent,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          className="stroke-border"
        />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
          width={48}
        />
        <Tooltip
          formatter={(value) => [
            `$${Number(value).toLocaleString()}`,
            "Monthly rent",
          ]}
          cursor={{ fill: "var(--muted)" }}
        />
        <Bar dataKey="revenue" fill="var(--primary)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
