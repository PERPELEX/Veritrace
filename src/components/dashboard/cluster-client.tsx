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
import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  Squares2X2Icon,
  ClockIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/common/site-logo";
import type { ClusterPageData } from "@/lib/dashboard-cluster-data";

type Props = {
  fullName: string;
  clusterData: ClusterPageData;
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

export function DashboardClusterClient({ fullName, clusterData }: Props) {
  const router = useRouter();
  const [chartsReady, setChartsReady] = useState(false);
  const [startDate, setStartDate] = useState(clusterData.selectedStartDate);
  const [endDate, setEndDate] = useState(clusterData.selectedEndDate);
  const [trendName, setTrendName] = useState(clusterData.selectedTrendName);
  const [filterError, setFilterError] = useState("");

  const hasDateFilterChanges = useMemo(
    () =>
      startDate !== clusterData.selectedStartDate ||
      endDate !== clusterData.selectedEndDate,
    [startDate, endDate, clusterData.selectedStartDate, clusterData.selectedEndDate],
  );

  const hasTrendFilterChanges = useMemo(
    () => trendName !== clusterData.selectedTrendName,
    [trendName, clusterData.selectedTrendName],
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
    router.push(queryString ? `/dashboard/cluster?${queryString}` : "/dashboard/cluster");
    router.refresh();
  };

  const applyTrendFilter = () => {
    setFilterError("");
    const query = new URLSearchParams();
    if (clusterData.selectedStartDate) {
      query.set("startDate", clusterData.selectedStartDate);
    }
    if (clusterData.selectedEndDate) {
      query.set("endDate", clusterData.selectedEndDate);
    }
    if (trendName) {
      query.set("trendName", trendName);
    }

    const queryString = query.toString();
    router.push(queryString ? `/dashboard/cluster?${queryString}` : "/dashboard/cluster");
    router.refresh();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setFilterError("");
    const query = new URLSearchParams();
    if (clusterData.selectedTrendName) {
      query.set("trendName", clusterData.selectedTrendName);
    }
    const queryString = query.toString();
    router.push(queryString ? `/dashboard/cluster?${queryString}` : "/dashboard/cluster");
    router.refresh();
  };

  const clearTrendFilter = () => {
    setTrendName("");
    setFilterError("");
    const query = new URLSearchParams();
    if (clusterData.selectedStartDate) {
      query.set("startDate", clusterData.selectedStartDate);
    }
    if (clusterData.selectedEndDate) {
      query.set("endDate", clusterData.selectedEndDate);
    }
    const queryString = query.toString();
    router.push(queryString ? `/dashboard/cluster?${queryString}` : "/dashboard/cluster");
    router.refresh();
  };

  useEffect(() => {
    setChartsReady(true);
  }, []);

  return (
    <main className="min-h-screen bg-[#232427] p-2 sm:p-3">
      <section className="mx-auto flex min-h-[calc(100vh-12px)] max-w-[1400px] flex-col overflow-hidden rounded-2xl bg-[#f1f2f4] lg:flex-row">
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
            <Link href="/dashboard/cluster" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-white">
              <Squares2X2Icon className="h-5 w-5" />
              Clusters
            </Link>
            <Link href="/dashboard/search" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search
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
          {clusterData.warning ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {clusterData.warning}
            </div>
          ) : null}

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Cluster Analysis</h2>
            <p className="text-sm text-slate-500">Clusters filtered by selected dates and optional trend</p>
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
                {clusterData.availableTrends.map((item) => (
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
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Total Cluster Tweets</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-slate-900 sm:text-5xl">
                {formatCompact(clusterData.totalClusterTweets)}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Unique Clusters</p>
              <p className="mt-3 font-[var(--font-space-grotesk)] text-4xl font-semibold text-slate-900 sm:text-5xl">
                {clusterData.uniqueClusters}
              </p>
            </article>
            <article className="rounded-2xl border border-slate-200 bg-white p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">Top Cluster</p>
              <p className="mt-3 break-words text-2xl leading-tight font-semibold text-slate-900">
                {clusterData.topClusterName}
              </p>
            </article>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-8">
              <p className="text-xl font-semibold text-slate-800">Cluster Volume Distribution</p>
              <div className="mt-3 h-64 w-full min-w-0 overflow-hidden sm:h-80">
                {chartsReady ? (
                  <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                    <BarChart data={clusterData.clusters}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                      <Tooltip
                        formatter={(value) => [`${formatCompact(Number(value))} tweets`, "Tweets"]}
                        contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                      />
                      <Bar dataKey="tweets" fill="#2f7f76" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full w-full rounded-xl bg-slate-100" />
                )}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <p className="text-xl font-semibold text-slate-800">Cluster Breakdown</p>
              <div className="mt-3 max-h-[390px] space-y-2 overflow-y-auto pr-1">
                {clusterData.clusters.map((cluster) => (
                  <div key={cluster.name} className="rounded-lg border border-slate-200 px-3 py-2">
                    <p className="text-sm font-semibold text-slate-800">{cluster.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{formatCompact(cluster.tweets)} tweets</p>
                  </div>
                ))}
                {!clusterData.clusters.length ? (
                  <p className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                    No cluster records found for the selected filters.
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
