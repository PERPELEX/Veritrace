"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  Squares2X2Icon,
  ClockIcon,
  Cog6ToothIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/common/site-logo";
import type { SentimentPageData } from "@/lib/dashboard-sentiment-data";

type Props = {
  fullName: string;
  sentimentData: SentimentPageData;
};

function formatCompact(n: number) {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000)}K`;
  }
  return String(n);
}

export function DashboardSentimentClient({ fullName, sentimentData }: Props) {
  const router = useRouter();
  const [chartsReady, setChartsReady] = useState(false);
  const [startDate, setStartDate] = useState(sentimentData.selectedStartDate);
  const [endDate, setEndDate] = useState(sentimentData.selectedEndDate);
  const [trendName, setTrendName] = useState(sentimentData.selectedTrendName);
  const [filterError, setFilterError] = useState("");

  const hasFilterChanges = useMemo(
    () =>
      startDate !== sentimentData.selectedStartDate ||
      endDate !== sentimentData.selectedEndDate ||
      trendName !== sentimentData.selectedTrendName,
    [startDate, endDate, trendName, sentimentData.selectedStartDate, sentimentData.selectedEndDate, sentimentData.selectedTrendName],
  );

  useEffect(() => {
    setChartsReady(true);
  }, []);

  const applyDateFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setFilterError("Start date cannot be after end date.");
      return;
    }

    setFilterError("");
    const query = new URLSearchParams();
    if (startDate) {
      query.set("startDate", startDate);
    }
    if (endDate) {
      query.set("endDate", endDate);
    }
    if (trendName) {
      query.set("trendName", trendName);
    }

    const queryString = query.toString();
    router.push(queryString ? `/dashboard/sentiment?${queryString}` : "/dashboard/sentiment");
    router.refresh();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setTrendName("");
    setFilterError("");
    router.push("/dashboard/sentiment");
    router.refresh();
  };

  const topNegativeClusters = [...sentimentData.clusterMatrix]
    .sort((a, b) => b.negative - a.negative)
    .slice(0, 6);

  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <aside className="hidden w-[260px] shrink-0 bg-gradient-to-b from-[#00130f] via-[#003526] to-[#00120f] px-6 py-8 text-white lg:flex lg:flex-col">
          <SiteLogo className="h-20 w-auto" width={300} height={100} />
          <p className="mt-10 text-sm uppercase tracking-[0.22em] text-emerald-100/70">Menu</p>

          <nav className="mt-4 space-y-2 text-[18px]">
            <Link href="/dashboard" className="flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <ChartBarSquareIcon className="h-5 w-5" />
              Overview
            </Link>
            <Link href="/dashboard/trend" className="flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <GlobeAltIcon className="h-5 w-5" />
              Trends
            </Link>
            <Link href="/dashboard/powerbi" className="flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <ComputerDesktopIcon className="h-5 w-5" />
              Power BI
            </Link>
            <Link href="/dashboard/cluster" className="flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <Squares2X2Icon className="h-5 w-5" />
              Clusters
            </Link>
            <Link href="/dashboard/search" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search
            </Link>
            <Link href="/dashboard/sentiment" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-white">
              <ChartPieIcon className="h-5 w-5" />
              Sentiment
            </Link>
          </nav>

          <div className="my-8 border-t border-emerald-100/20" />

          <p className="text-sm uppercase tracking-[0.22em] text-emerald-100/70">General</p>
          <nav className="mt-4 space-y-2 text-[18px]">
            <Link href="/dashboard/about" className="flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <ClockIcon className="h-5 w-5" />
              About
            </Link>
            <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </Link>
          </nav>

          <div className="mt-auto border-t border-emerald-100/20 pt-5">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-emerald-100/70">Signed In</p>
            <p className="text-sm text-white/90">{fullName}</p>
          </div>
        </aside>

        <section className="w-full p-3 sm:p-4 lg:p-6">
          <nav className="mb-3 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-sm lg:hidden">
            <Link href="/dashboard" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Overview
            </Link>
            <Link href="/dashboard/trend" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Trends
            </Link>
            <Link href="/dashboard/powerbi" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Power BI
            </Link>
            <Link href="/dashboard/cluster" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Clusters
            </Link>
            <Link href="/dashboard/search" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Search
            </Link>
            <Link href="/dashboard/sentiment" className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-800">
              Sentiment
            </Link>
            <Link href="/dashboard/about" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              About
            </Link>
            <Link href="/dashboard/settings" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Settings
            </Link>
          </nav>

          {sentimentData.warning ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {sentimentData.warning}
            </div>
          ) : null}

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Sentiment Intelligence</h2>
            <p className="text-sm text-slate-500">Combined report: sentiment analysis results with cluster mapping</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 p-2">
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                aria-label="Start date"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700"
                aria-label="End date"
              />
              <select
                value={trendName}
                onChange={(event) => setTrendName(event.target.value)}
                className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 sm:min-w-[220px] sm:w-auto"
                aria-label="Trend name"
              >
                <option value="">All Trends</option>
                {sentimentData.availableTrends.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                onClick={applyDateFilter}
                disabled={!hasFilterChanges}
                className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Apply Filter
              </button>
              <button
                onClick={clearDateFilter}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600"
              >
                Clear
              </button>
            </div>
            {filterError ? <p className="mt-2 text-xs text-red-600">{filterError}</p> : null}
          </header>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-4">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Analyzed Tweets</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-slate-900 sm:text-5xl">
                {formatCompact(sentimentData.totalAnalyzed)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Positive</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-emerald-700 sm:text-5xl">
                {formatCompact(sentimentData.positiveCount)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Negative</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-amber-600 sm:text-5xl">
                {formatCompact(sentimentData.negativeCount)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Neutral</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-[#2f7f76] sm:text-5xl">
                {formatCompact(sentimentData.neutralCount)}
              </p>
            </article>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <p className="text-xl font-semibold text-slate-800">Sentiment Distribution</p>
              <div className="mt-3 h-64 w-full min-w-0 overflow-hidden">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <PieChart>
                      <Pie data={sentimentData.distribution} dataKey="count" nameKey="sentiment" innerRadius={50} outerRadius={85} stroke="none" paddingAngle={2}>
                        {sentimentData.distribution.map((entry) => (
                          <Cell key={entry.sentiment} fill={entry.color} />
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
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-8">
              <p className="text-xl font-semibold text-slate-800">Daily Sentiment Trend</p>
              <div className="mt-3 h-64 w-full min-w-0 overflow-hidden sm:h-72">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <BarChart data={sentimentData.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dayLabel" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Bar dataKey="positive" stackId="a" fill="#8fce00" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="negative" stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="neutral" stackId="a" fill="#2f7f76" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-12">
              <p className="text-xl font-semibold text-slate-800">Trend Sentiment Pulse</p>
              <p className="text-xs text-slate-500">
                {trendName ? `Selected trend: ${trendName}` : "Select a trend to isolate sentiment momentum for that topic."}
              </p>
              <div className="mt-3 h-72 w-full min-w-0 overflow-hidden">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                    <LineChart data={sentimentData.trendPulse}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dayLabel" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <YAxis yAxisId="left" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} label={{ value: "Tweet Count", angle: -90, position: "insideLeft", style: { fontSize: 11, fill: "#64748b" } }} />
                      <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} domain={[-100, 100]} label={{ value: "Pulse (%)", angle: 90, position: "insideRight", style: { fontSize: 11, fill: "#64748b" } }} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "pulse") {
                            return [`${Number(value).toLocaleString()}%`, "Pulse"];
                          }
                          return [Number(value).toLocaleString(), String(name)];
                        }}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Line yAxisId="left" type="monotone" dataKey="positive" stroke="#8fce00" strokeWidth={2.5} dot={{ r: 2 }} name="Positive" />
                      <Line yAxisId="left" type="monotone" dataKey="negative" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 2 }} name="Negative" />
                      <Line yAxisId="right" type="monotone" dataKey="pulse" stroke="#2f7f76" strokeWidth={2.5} strokeDasharray="4 4" dot={{ r: 2 }} name="Pulse" />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-7">
              <p className="text-xl font-semibold text-slate-800">Sentiment by Cluster (Merged)</p>
              <div className="mt-3 h-72 w-full min-w-0 overflow-hidden">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={250}>
                    <BarChart data={sentimentData.clusterMatrix} layout="vertical" margin={{ left: 20, right: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="clusterName" width={110} tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value, name) => [Number(value).toLocaleString(), String(name)]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Bar dataKey="positive" stackId="a" fill="#8fce00" />
                      <Bar dataKey="negative" stackId="a" fill="#f59e0b" />
                      <Bar dataKey="neutral" stackId="a" fill="#2f7f76" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-5">
              <p className="text-xl font-semibold text-slate-800">Top Negative Clusters</p>
              <div className="mt-3 max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {topNegativeClusters.map((cluster) => (
                  <div key={cluster.clusterName} className="rounded-lg border border-slate-200 px-3 py-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{cluster.clusterName}</p>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-medium text-amber-700">Negative</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">{formatCompact(cluster.negative)} negative tweets</p>
                    <p className="text-xs text-slate-400">Total mapped tweets: {formatCompact(cluster.total)}</p>
                  </div>
                ))}
                {!topNegativeClusters.length ? (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    No merged sentiment-cluster records found for the selected dates.
                  </p>
                ) : null}
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
