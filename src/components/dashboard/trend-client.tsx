"use client";

import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  ChartPieIcon,
  Squares2X2Icon,
  ClockIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/common/site-logo";
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
import type { TrendPageData } from "@/lib/dashboard-trend-data";

type Props = {
  fullName: string;
  trendData: TrendPageData;
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

const heatLevelStyles: Record<string, string> = {
  low: "bg-[#2f7f76] text-white",
  medium: "bg-[#9acb3f] text-slate-900",
  high: "bg-[#fe9f1c] text-white",
};

const trendPalette = ["#2f7f76", "#9acb3f", "#f59e0b", "#38bdf8", "#6366f1", "#ef4444"];

export function DashboardTrendClient({ fullName, trendData }: Props) {
  const router = useRouter();
  const [chartsReady, setChartsReady] = useState(false);
  const [startDate, setStartDate] = useState(trendData.selectedStartDate);
  const [endDate, setEndDate] = useState(trendData.selectedEndDate);
  const [trendName, setTrendName] = useState(trendData.selectedTrendName);
  const [filterError, setFilterError] = useState("");

  const hasDateFilterChanges = useMemo(
    () =>
      startDate !== trendData.selectedStartDate ||
      endDate !== trendData.selectedEndDate,
    [startDate, endDate, trendData.selectedStartDate, trendData.selectedEndDate],
  );

  const hasTrendFilterChanges = useMemo(
    () => trendName !== trendData.selectedTrendName,
    [trendName, trendData.selectedTrendName],
  );

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

    const queryString = query.toString();
    router.push(queryString ? `/dashboard/trend?${queryString}` : "/dashboard/trend");
    router.refresh();
  };

  const applyTrendFilter = () => {
    setFilterError("");
    const query = new URLSearchParams();
    if (trendData.selectedStartDate) {
      query.set("startDate", trendData.selectedStartDate);
    }
    if (trendData.selectedEndDate) {
      query.set("endDate", trendData.selectedEndDate);
    }
    if (trendName) {
      query.set("trendName", trendName);
    }

    const queryString = query.toString();
    router.push(queryString ? `/dashboard/trend?${queryString}` : "/dashboard/trend");
    router.refresh();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilterError("");
    const query = new URLSearchParams();
    if (trendData.selectedTrendName) {
      query.set("trendName", trendData.selectedTrendName);
    }
    const queryString = query.toString();
    router.push(queryString ? `/dashboard/trend?${queryString}` : "/dashboard/trend");
    router.refresh();
  };

  const clearTrendFilter = () => {
    setTrendName("");
    setFilterError("");
    const query = new URLSearchParams();
    if (trendData.selectedStartDate) {
      query.set("startDate", trendData.selectedStartDate);
    }
    if (trendData.selectedEndDate) {
      query.set("endDate", trendData.selectedEndDate);
    }
    const queryString = query.toString();
    router.push(queryString ? `/dashboard/trend?${queryString}` : "/dashboard/trend");
    router.refresh();
  };

  const treeLevels = useMemo(() => {
    const levels: typeof trendData.posterTree[] = [];
    const MAX_LEVELS = 5;
    if (!trendData?.posterTree?.length) {
      return levels;
    }
    trendData.posterTree.forEach((node, index) => {
      const level = Math.min(Math.floor(Math.log2(index + 1)), MAX_LEVELS - 1);
      if (!levels[level]) {
        levels[level] = [];
      }
      levels[level].push(node);
    });
    return levels;
  }, [trendData]);

  const momentumData = useMemo(
    () =>
      trendData.dailyVolume.map((point, index) => {
        const previous = index > 0 ? trendData.dailyVolume[index - 1].tweetCount : 0;
        const delta = index > 0 ? point.tweetCount - previous : 0;
        const pctDelta = previous > 0 ? (delta / previous) * 100 : 0;
        return {
          dayLabel: point.dayLabel,
          tweetCount: point.tweetCount,
          delta,
          pctDelta: Number.isFinite(pctDelta) ? Math.round(pctDelta) : 0,
        };
      }),
    [trendData.dailyVolume],
  );

  const trendShareData = useMemo(() => {
    const total = trendData.topTrends.reduce((sum, item) => sum + item.tweetCount, 0);
    return trendData.topTrends.slice(0, 6).map((item) => ({
      trendName: item.trendName,
      tweetCount: item.tweetCount,
      sharePct: total > 0 ? Math.round((item.tweetCount / total) * 100) : 0,
    }));
  }, [trendData.topTrends]);

  useEffect(() => {
    setChartsReady(true);
  }, []);

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
            <Link href="/dashboard/trend" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-white">
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
            <Link href="/dashboard/sentiment" className="flex items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
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
            <Link href="/dashboard/trend" className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-800">
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
            <Link href="/dashboard/sentiment" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Sentiment
            </Link>
            <Link href="/dashboard/about" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              About
            </Link>
            <Link href="/dashboard/settings" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Settings
            </Link>
          </nav>

          {trendData.warning ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {trendData.warning}
            </div>
          ) : null}

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Trend Analysis</h2>
            <p className="text-sm text-slate-500">Live trend volume analytics</p>
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
              <button
                onClick={applyDateFilter}
                disabled={!hasDateFilterChanges}
                className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Apply Dates
              </button>
              <button
                onClick={clearDateFilter}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600"
              >
                Clear Dates
              </button>
              <span className="mx-1 text-xs text-slate-300">|</span>
              <select
                value={trendName}
                onChange={(event) => setTrendName(event.target.value)}
                className="w-full min-w-0 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-700 sm:min-w-[220px] sm:w-auto"
                aria-label="Trend name"
              >
                <option value="">All Trends</option>
                {trendData.availableTrends.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <button
                onClick={applyTrendFilter}
                disabled={!hasTrendFilterChanges}
                className="rounded-md bg-slate-900 px-3 py-1 text-xs text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Apply Trend
              </button>
              <button
                onClick={clearTrendFilter}
                className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-600"
              >
                Clear Trend
              </button>
            </div>
            {filterError ? <p className="mt-2 text-xs text-red-600">{filterError}</p> : null}
          </header>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Trend Tweets</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-slate-900 sm:text-5xl">{formatCompact(trendData.totalTweets)}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Tracked Trends</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-slate-900 sm:text-5xl">{trendData.trendCount}</p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Top Trend</p>
              <p className="mt-3 break-words text-2xl leading-tight font-semibold text-slate-900">
                {trendData.topTrends[0]?.trendName ?? "N/A"}
              </p>
              <p className="mt-1 text-sm text-slate-500">{formatCompact(trendData.topTrends[0]?.tweetCount ?? 0)} tweets</p>
            </article>
          </div>

          {trendData.selectedTrendName && trendData.topPoster ? (
            <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Top Poster on {trendData.selectedTrendName}</p>
              <p className="mt-3 break-words text-2xl leading-tight font-semibold text-slate-900">{trendData.topPoster.name}</p>
              <p className="mt-1 text-sm text-slate-500">{formatCompact(trendData.topPoster.tweetCount)} tweets</p>
            </div>
          ) : null}

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-7">
              <p className="text-xl font-semibold text-slate-800">Daily Tweet Volume (Last 7 Days)</p>
              <div className="mt-3 h-64 w-full min-w-0 overflow-hidden sm:h-72">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <BarChart data={trendData.dailyVolume}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dayLabel" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => [`${formatCompact(Number(value))} tweets`, "Volume"]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Bar dataKey="tweetCount" fill="#2f7f76" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-5">
              <p className="text-xl font-semibold text-slate-800">Trend Momentum (Day-over-Day)</p>
              <p className="text-xs text-slate-500">Shows acceleration or slowdown between consecutive days.</p>
              <div className="mt-3 h-64 w-full min-w-0 overflow-hidden sm:h-72">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <LineChart data={momentumData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="dayLabel" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value, name) => {
                          if (name === "delta") {
                            return [`${formatCompact(Number(value))} tweets`, "Daily change"];
                          }
                          if (name === "pctDelta") {
                            return [`${Number(value)}%`, "Change %"];
                          }
                          return [formatCompact(Number(value)), "Tweets"];
                        }}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="delta" stroke="#f59e0b" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <p className="text-xl font-semibold text-slate-800">Top Trend Share</p>
              <p className="text-xs text-slate-500">Relative share across current leading trends.</p>
              <div className="mt-3 h-64 w-full min-w-0 overflow-hidden">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                    <BarChart data={trendShareData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="trendName" tick={{ fontSize: 10, fill: "#334155" }} axisLine={false} tickLine={false} width={95} />
                      <Tooltip
                        formatter={(value, _name, item) => {
                          const payload = item.payload as { sharePct: number };
                          return [`${formatCompact(Number(value))} tweets (${payload.sharePct}%)`, "Share"];
                        }}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Bar dataKey="tweetCount" fill="#2f7f76" radius={[0, 6, 6, 0]}>
                        {trendShareData.map((item, index) => (
                          <Cell key={item.trendName} fill={trendPalette[index % trendPalette.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-8">
              <p className="text-xl font-semibold text-slate-800">Top 5 Posters in Sequence</p>
              <div className="mt-3 space-y-2">
                {trendData.top5Posters.length > 0 ? (
                  trendData.top5Posters.map((poster, index) => (
                    <div key={poster.name} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">#{index + 1}</p>
                        <p className="text-sm text-slate-700">{poster.name}</p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">{poster.appearances}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">No poster sequence data available.</p>
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-12">
              <p className="text-xl font-semibold text-slate-800">User Location Heat Map</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {trendData.trendHeatMap.map((item) => (
                  <div key={item.location} className={`rounded-xl p-4 text-center ${heatLevelStyles[item.level]}`}>
                    <p className="text-sm font-semibold">{item.location}</p>
                    <p className="mt-1 text-xs opacity-90">{formatCompact(item.tweets)} tweets</p>
                  </div>
                ))}
              </div>
              {trendData.trendHeatMap.length ? (
                <p className="mt-3 text-xs text-slate-500">Heat map is scoped to active date and trend filters.</p>
              ) : (
                <p className="mt-3 text-xs text-slate-500">No location data found for the selected filters.</p>
              )}
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-12">
              <p className="text-xl font-semibold text-slate-800">Tree Analysis: Earliest Posters</p>
              <p className="mt-1 text-sm text-slate-600">
                First poster: <span className="font-semibold">{trendData.firstPoster}</span> | Second poster:{" "}
                <span className="font-semibold">{trendData.secondPoster}</span>
              </p>

              <div className="mt-4 h-64 w-full min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="mb-2 text-sm font-medium text-slate-700">Posting Timeline (by actual tweet time)</p>
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
                    <LineChart data={trendData.posterTimeline}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis
                        dataKey="sequence"
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={false}
                        tickLine={false}
                        label={{ value: "Post sequence", position: "insideBottom", offset: -4, fill: "#64748b" }}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: "#334155" }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(value) => new Date(Number(value)).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      />
                      <Tooltip
                        formatter={(value) => {
                          const numericValue = Number(value ?? 0);
                          return [new Date(numericValue).toLocaleString("en-GB", { hour12: false }), "Posted at"];
                        }}
                        labelFormatter={(label) => `Post #${label}`}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Line type="monotone" dataKey="epochMs" stroke="#2f7f76" strokeWidth={2.5} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>

              <div className="mt-4 space-y-3">
                {treeLevels.map((levelNodes, levelIdx) => (
                  <div key={`level-${levelIdx}`} className="grid gap-2" style={{ gridTemplateColumns: `repeat(${levelNodes.length}, minmax(0, 1fr))` }}>
                    {levelNodes.map((node) => (
                      <div key={node.id} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                        <p className="text-xs text-slate-500">#{node.ordinal}</p>
                        <p className="break-words text-sm font-semibold text-slate-800">{node.label}</p>
                        <p className="text-xs text-slate-500">{node.location}</p>
                        <p className="text-xs text-slate-500">{node.postedAt}</p>
                      </div>
                    ))}
                  </div>
                ))}
                {!treeLevels.length ? (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    No tree analysis data found for the selected filter values.
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
