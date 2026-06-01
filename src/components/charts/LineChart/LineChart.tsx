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

const MONO = "var(--font-geist-mono), ui-monospace, monospace";

type LineChartProps = {
  data: LineDataPoint[];
  height?: number;
  labelFormatter?: (day: string) => string;
  "aria-label": string;
};

function LineChart({
  data,
  height = 240,
  labelFormatter,
  "aria-label": ariaLabel,
}: LineChartProps) {
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
            tick={{ fontSize: 11, fill: CHART_COLORS.axisLabel, fontFamily: MONO }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v: number) =>
              v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
            }
          />

          <Tooltip
            cursor={{ stroke: CHART_COLORS.primary, strokeWidth: 1, strokeOpacity: 0.4 }}
            content={(props) => {
              if (!props.active || !props.payload?.length) return null;
              const raw = props.payload[0]?.value;
              const value = typeof raw === "number" ? raw : 0;
              const day = String(props.label ?? "");
              const label = labelFormatter ? labelFormatter(day) : day;

              return (
                <div
                  className="rounded-lg px-3 py-2 text-xs font-medium"
                  style={{ background: "hsl(240, 10%, 12%)", color: "#fff" }}
                >
                  <span>{label}</span>
                  <span style={{ margin: "0 6px", opacity: 0.45 }}>·</span>
                  <span
                    className="font-bold tabular-nums"
                    style={{ fontFamily: MONO }}
                  >
                    R$ {value.toLocaleString("pt-BR")}
                  </span>
                </div>
              );
            }}
          />

          <Area
            type="monotone"
            dataKey="value"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill="url(#balanceGradient)"
            dot={false}
            activeDot={{
              r: 5,
              fill: CHART_COLORS.primary,
              stroke: "#fff",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export { LineChart };
