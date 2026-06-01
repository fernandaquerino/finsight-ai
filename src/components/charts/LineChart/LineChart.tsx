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

import type { LineDataPoint } from "@/features/dashboard/types/dashboard.types";
import { CHART_COLORS } from "@/lib/chart-colors";

type LineChartProps = {
  data: LineDataPoint[];
  height?: number;
  "aria-label": string;
};

function LineChart({ data, height = 240, "aria-label": ariaLabel }: LineChartProps) {
  return (
    <div role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
          <defs>
            <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={CHART_COLORS.primary} stopOpacity={0.12} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={CHART_COLORS.grid}
            vertical={false}
          />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />
          <Tooltip
            contentStyle={{
              borderRadius: "0.5rem",
              border: `1px solid ${CHART_COLORS.grid}`,
              fontSize: 12,
            }}
            formatter={(value) => {
              const n = typeof value === "number" ? value : 0;
              return [`R$ ${n.toLocaleString("pt-BR")}`, "Saldo"];
            }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { LineChart };
