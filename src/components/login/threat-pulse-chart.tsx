"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const data = [
  { day: "Mon", risk: 32 },
  { day: "Tue", risk: 46 },
  { day: "Wed", risk: 41 },
  { day: "Thu", risk: 57 },
  { day: "Fri", risk: 52 },
  { day: "Sat", risk: 66 },
  { day: "Sun", risk: 61 },
];

export function ThreatPulseChart() {
  return (
    <div className="mt-4 overflow-x-auto">
      <AreaChart width={320} height={140} data={data} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="riskGlow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#a3e635" stopOpacity={0.55} />
              <stop offset="95%" stopColor="#86efac" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(167, 243, 208, 0.2)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fill: "rgba(236, 253, 245, 0.65)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fill: "rgba(236, 253, 245, 0.65)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={28}
          />
          <Tooltip
            contentStyle={{
              borderRadius: 12,
              border: "1px solid rgba(167, 243, 208, 0.3)",
              backgroundColor: "rgba(6, 20, 17, 0.9)",
              color: "#ecfdf5",
              fontSize: 12,
            }}
            labelStyle={{ color: "#bbf7d0" }}
          />
          <Area
            type="monotone"
            dataKey="risk"
            stroke="#bef264"
            strokeWidth={2.25}
            fill="url(#riskGlow)"
            fillOpacity={1}
          />
      </AreaChart>
    </div>
  );
}
