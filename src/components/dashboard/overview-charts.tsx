"use client";

import {
  Bar,
  BarChart,
  Cell,
  LabelList,
  Pie,
  PieChart,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { useEffect, useState } from "react";
import { dashboardClusterColors } from "@/lib/dashboard-types";
import type { ClusterPoint, RatioPoint, SentimentPoint } from "@/lib/dashboard-types";

type SentimentDonutChartProps = {
  data: SentimentPoint[];
};

type MisinformationRatioChartProps = {
  data: RatioPoint[];
};

type TopicClusterChartProps = {
  data: ClusterPoint[];
};

type AccuracyGaugeProps = {
  score: number;
};

function useChartReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  return ready;
}

export function SentimentDonutChart({ data }: SentimentDonutChartProps) {
  const chartReady = useChartReady();
  const sentimentData = data.length
    ? data
    : [
        { name: "Positive", value: 0, color: "#8fce00" },
        { name: "Negative", value: 0, color: "#f59e0b" },
        { name: "Neutral", value: 0, color: "#2f7f76" },
      ];

  return (
    <div className="h-52 w-full min-w-0 overflow-hidden">
      {chartReady ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
          <PieChart>
            <Pie
              data={sentimentData}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              outerRadius={82}
              stroke="none"
              paddingAngle={2}
            >
              {sentimentData.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
          </PieChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-xl bg-slate-100" />
      )}
    </div>
  );
}

export function MisinformationRatioChart({ data }: MisinformationRatioChartProps) {
  const chartReady = useChartReady();
  const misinformationRatio = data.length ? data : [{ trend: "N/A", positive: 0, negative: 0 }];

  return (
    <div className="h-48 w-full min-w-0 overflow-hidden">
      {chartReady ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={170}>
          <BarChart data={misinformationRatio} barSize={14}>
            <XAxis dataKey="trend" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
            <Tooltip
              cursor={{ fill: "rgba(148, 163, 184, 0.08)" }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            <Bar dataKey="positive" stackId="a" fill="#9acb3f" radius={[4, 4, 0, 0]} />
            <Bar dataKey="negative" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-xl bg-slate-100" />
      )}
    </div>
  );
}

export function TopicClusterChart({ data }: TopicClusterChartProps) {
  const chartReady = useChartReady();
  const clusterData = data.length ? data : [{ x: 50, y: 50, z: 0, name: "No data" }];
  const minBubble = 400;
  const maxBubble = 3200;

  return (
    <div className="h-56 w-full min-w-0 overflow-hidden rounded-xl bg-slate-50 p-2">
      {chartReady ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
          <ScatterChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
            <XAxis type="number" dataKey="x" hide domain={[0, 100]} />
            <YAxis type="number" dataKey="y" hide domain={[0, 100]} />
            <ZAxis type="number" dataKey="z" range={[minBubble, maxBubble]} />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              formatter={(_value, _name, item) => {
                const payload = item.payload as { z: number };
                return [`${payload.z.toLocaleString()} tweets`, "Volume"];
              }}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
            />
            {clusterData.map((node, index) => (
              <Scatter key={node.name} name={node.name} data={[node]} fill={dashboardClusterColors[index % dashboardClusterColors.length]}>
                <Cell fill={dashboardClusterColors[index % dashboardClusterColors.length]} />
                <LabelList dataKey="name" position="middle" className="fill-slate-900 text-[10px] font-semibold" />
              </Scatter>
            ))}
          </ScatterChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-xl bg-slate-100" />
      )}
    </div>
  );
}

export function AccuracyGauge({ score }: AccuracyGaugeProps) {
  const chartReady = useChartReady();
  const safeScore = Math.max(0, Math.min(100, score));

  return (
    <div className="h-40 w-full min-w-0 overflow-hidden">
      {chartReady ? (
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={140}>
          <RadialBarChart innerRadius="70%" outerRadius="100%" barSize={12} data={[{ name: "score", value: safeScore }]} startAngle={180} endAngle={0}>
            <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
            <RadialBar dataKey="value" cornerRadius={8} fill="#2f7f76" />
            <text x="50%" y="70%" textAnchor="middle" dominantBaseline="middle" className="fill-slate-700 text-sm">
              Accuracy {safeScore}%
            </text>
          </RadialBarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-full w-full rounded-xl bg-slate-100" />
      )}
    </div>
  );
}
