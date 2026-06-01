"use client";

import { Label, Pie, PieChart, ResponsiveContainer } from "recharts";

import type { CategoryData } from "@/features/dashboard/types/dashboard.types";
import { CHART_COLORS } from "@/lib/chart-colors";

type DonutChartProps = {
  data: CategoryData[];
  height?: number;
  activeIndex?: number;
  "aria-label": string;
};

function DonutChart({
  data,
  height = 200,
  activeIndex,
  "aria-label": ariaLabel,
}: DonutChartProps) {
  const activeItem = activeIndex !== undefined ? data[activeIndex] : undefined;
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const totalFormatted = `R$ ${total.toLocaleString("pt-BR")}`;

  // Recharts v3: colors + per-slice opacity via data items.
  // When a slice is active, all others fade to 0.15 opacity.
  const chartData = data.map((d, i) => ({
    ...d,
    fill: d.color,
    fillOpacity: activeIndex === undefined ? 1 : i === activeIndex ? 1 : 0.15,
  }));

  return (
    // Tailwind arbitrary variant adds CSS transition on every recharts-sector
    // so fill-opacity animates smoothly between full and faded states.
    <div
      role="img"
      aria-label={ariaLabel}
      className="[&_.recharts-sector]:transition-[fill-opacity] [&_.recharts-sector]:duration-150"
    >
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={58}
            outerRadius={88}
            dataKey="value"
            stroke="none"
            paddingAngle={2}
            isAnimationActive={false}
          >
            <Label
              content={({ viewBox }) => {
                const vb = viewBox as { cx?: number; cy?: number } | undefined;
                if (!vb?.cx || !vb?.cy) return null;
                const { cx, cy } = vb;

                if (activeItem) {
                  return (
                    <g>
                      <text
                        x={cx}
                        y={cy - 16}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
                      >
                        {activeItem.name}
                      </text>
                      <text
                        x={cx}
                        y={cy + 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontSize: 14,
                          fontWeight: 700,
                          fill: "hsl(240, 10%, 12%)",
                        }}
                      >
                        R$ {activeItem.value.toLocaleString("pt-BR")}
                      </text>
                      <text
                        x={cx}
                        y={cy + 18}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
                      >
                        {activeItem.percentage}%
                      </text>
                    </g>
                  );
                }

                return (
                  <g>
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{ fontSize: 11, fill: CHART_COLORS.axisLabel }}
                    >
                      Total
                    </text>
                    <text
                      x={cx}
                      y={cy + 10}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        fill: "hsl(240, 10%, 12%)",
                      }}
                    >
                      {totalFormatted}
                    </text>
                  </g>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export { DonutChart };
