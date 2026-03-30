"use client";

import {
  ArrowDownTrayIcon,
  ChartBarSquareIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  ChartPieIcon,
  Cog6ToothIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  GlobeAltIcon,
  ClockIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { SiteLogo } from "@/components/common/site-logo";
import {
  AccuracyGauge,
  MisinformationRatioChart,
  SentimentDonutChart,
  TopicClusterChart,
} from "@/components/dashboard/overview-charts";
import type { OverviewData } from "@/lib/dashboard-types";

const OverviewLocationMap = dynamic(
  () => import("@/components/dashboard/overview-location-map").then((module) => module.OverviewLocationMap),
  { ssr: false },
);

type Props = {
  fullName: string;
  overviewData: OverviewData;
  selectedStartDate: string;
  selectedEndDate: string;
};

const levelColor: Record<string, string> = {
  verified: "bg-[#2f7f76]",
  neutral: "bg-slate-400",
  high: "bg-[#ef4444]",
};

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
}

function formatCompact(n: number) {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000)}K`;
  }
  return String(n);
}

export function DashboardOverviewClient({ fullName, overviewData, selectedStartDate, selectedEndDate }: Props) {
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [startDate, setStartDate] = useState(selectedStartDate);
  const [endDate, setEndDate] = useState(selectedEndDate);
  const [dateFilterError, setDateFilterError] = useState("");
  const router = useRouter();

  const hasFilterChanges = useMemo(
    () => startDate !== selectedStartDate || endDate !== selectedEndDate,
    [startDate, endDate, selectedStartDate, selectedEndDate],
  );

  const onLogout = async () => {
    try {
      setLoadingLogout(true);
      await logout();
      router.replace("/");
      router.refresh();
    } finally {
      setLoadingLogout(false);
    }
  };

  const applyDateFilter = () => {
    if (startDate && endDate && startDate > endDate) {
      setDateFilterError("Start date cannot be after end date.");
      return;
    }

    setDateFilterError("");
    const query = new URLSearchParams();
    if (startDate) {
      query.set("startDate", startDate);
    }
    if (endDate) {
      query.set("endDate", endDate);
    }
    const queryString = query.toString();
    router.push(queryString ? `/dashboard?${queryString}` : "/dashboard");
    router.refresh();
  };

  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setDateFilterError("");
    router.push("/dashboard");
    router.refresh();
  };

  const openSurgingTrendDetails = () => {
    const primaryTrend = overviewData.surgingTrends[0];
    if (!primaryTrend || primaryTrend === "No trend data") {
      router.push("/dashboard/trend");
      return;
    }

    const query = new URLSearchParams();
    if (startDate) {
      query.set("startDate", startDate);
    }
    if (endDate) {
      query.set("endDate", endDate);
    }
    query.set("trendName", primaryTrend);

    const queryString = query.toString();
    router.push(queryString ? `/dashboard/trend?${queryString}` : "/dashboard/trend");
  };

  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <aside className="hidden w-[260px] shrink-0 bg-gradient-to-b from-[#00130f] via-[#003526] to-[#00120f] px-6 py-8 text-white lg:flex lg:flex-col">
          <SiteLogo className="h-20 w-auto" width={300} height={100} />
          <p className="mt-10 text-sm uppercase tracking-[0.22em] text-emerald-100/70">Menu</p>

          <nav className="mt-4 space-y-2 text-[18px]">
            <a className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-white" href="/dashboard">
              <ChartBarSquareIcon className="h-5 w-5" />
              Overview
            </a>
            <a href="/dashboard/trend" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <GlobeAltIcon className="h-5 w-5" />
              Trends
            </a>
            <a href="/dashboard/powerbi" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <ComputerDesktopIcon className="h-5 w-5" />
              Power BI
            </a>
            <a href="/dashboard/search" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <MagnifyingGlassIcon className="h-5 w-5" />
              Search
            </a>
            <a href="/dashboard/sentiment" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <ChartPieIcon className="h-5 w-5" />
              Sentiment
            </a>
          </nav>

          <div className="my-8 border-t border-emerald-100/20" />

          <p className="text-sm uppercase tracking-[0.22em] text-emerald-100/70">General</p>
          <nav className="mt-4 space-y-2 text-[18px]">
            <a href="/dashboard/about" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <ClockIcon className="h-5 w-5" />
              About
            </a>
            <a href="/dashboard/settings" className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-emerald-50/90 transition hover:bg-white/8">
              <Cog6ToothIcon className="h-5 w-5" />
              Settings
            </a>
          </nav>

          <div className="mt-auto border-t border-emerald-100/20 pt-5">
            <p className="mb-2 text-xs uppercase tracking-[0.18em] text-emerald-100/70">Signed In</p>
            <p className="text-sm text-white/90">{fullName}</p>
            <button
              className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm transition hover:bg-white/20"
              onClick={onLogout}
              disabled={loadingLogout}
            >
              <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
              {loadingLogout ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </aside>

        <section className="w-full p-3 sm:p-4 lg:p-6">
          <div className="mb-3 flex items-center justify-between gap-2">
            <nav className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-sm lg:hidden">
              <a href="/dashboard" className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-800">
                Overview
              </a>
              <a href="/dashboard/trend" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
                Trends
              </a>
              <a href="/dashboard/powerbi" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
                Power BI
              </a>
              <a href="/dashboard/search" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
                Search
              </a>
              <a href="/dashboard/sentiment" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
                Sentiment
              </a>
              <a href="/dashboard/about" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              About
            </a>
            <a href="/dashboard/settings" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Settings
            </a>
          </nav>
          </div>

          {overviewData.dataWarning ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {overviewData.dataWarning}
            </div>
          ) : null}

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Dashboard</h2>
                <p className="text-sm text-slate-500">Overview</p>
              </div>
              <div className="flex w-full flex-col gap-2 xl:w-auto xl:flex-row xl:items-center">
                <div className="flex items-center gap-2">
                  <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800">
                    <GlobeAltIcon className="h-5 w-5" />
                  </button>
                  <button className="rounded-full border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:border-slate-300 hover:text-slate-800">
                    <UserCircleIcon className="h-5 w-5" />
                  </button>
                </div>
                <div className="grid w-full grid-cols-1 gap-2 rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white px-3 py-2 text-sm text-slate-700 shadow-sm sm:grid-cols-2 xl:flex xl:w-auto xl:flex-wrap xl:items-center xl:rounded-2xl">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(event) => setStartDate(event.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 xl:w-36"
                    aria-label="Start date"
                  />
                  <span className="hidden text-slate-400 xl:inline">to</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(event) => setEndDate(event.target.value)}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-2 text-xs text-slate-700 outline-none transition focus:border-slate-400 xl:w-36"
                    aria-label="End date"
                  />
                  <button
                    onClick={applyDateFilter}
                    disabled={!hasFilterChanges}
                    className="h-9 w-full rounded-lg bg-slate-900 px-3 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400 sm:w-auto"
                  >
                    Apply
                  </button>
                  <button
                    onClick={clearDateFilter}
                    className="h-9 w-full rounded-lg border border-slate-300 bg-white px-3 text-xs font-medium text-slate-600 transition hover:bg-slate-100 sm:w-auto"
                  >
                    Clear
                  </button>
                </div>
                <div className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-500 shadow-sm sm:w-auto sm:justify-start">
                  <MagnifyingGlassIcon className="h-4 w-4" />
                  Search
                </div>
              </div>
            </div>
            {dateFilterError ? <p className="mt-1 text-xs text-red-600">{dateFilterError}</p> : null}
          </header>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
            <article className="rounded-2xl bg-[#ff3b3b] p-5 text-white xl:col-span-4">
              <p className="flex items-center gap-2 text-2xl font-semibold sm:text-3xl">
                <ExclamationTriangleIcon className="h-8 w-8" />
                Surging Trends
              </p>
              <ul className="mt-4 space-y-2 text-lg">
                <li>↳ {overviewData.surgingTrends[0]}</li>
                <li>↳ {overviewData.surgingTrends[1]}</li>
              </ul>
              <button
                onClick={openSurgingTrendDetails}
                className="mt-8 text-sm font-medium text-white/90 transition hover:text-white"
              >
                See Details →
              </button>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <p className="text-3xl font-semibold text-slate-800">Total Tweets</p>
              <p className="mt-4 font-[var(--font-space-grotesk)] text-5xl font-semibold text-black sm:text-7xl">{overviewData.totalTweetsLabel}</p>
              <p className="mt-2 text-sm text-slate-500">Across tracked trends and monitored phrases</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <div className="mb-2 flex items-center justify-between">
                <p className="text-2xl font-semibold text-slate-800">Tweets Sentiment</p>
                <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">Total</span>
              </div>
              <SentimentDonutChart data={overviewData.sentimentData} />
              <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-slate-700">
                {overviewData.sentimentData.map((item) => (
                  <p key={item.name}><span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} /> {formatCompact(item.value)}</p>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <div className="mb-4 flex items-center justify-between">
                <p className="text-2xl font-semibold text-slate-800">Top Trends</p>
                <button className="rounded-full border border-slate-300 p-2 text-slate-500">
                  <ArrowDownTrayIcon className="h-4 w-4" />
                </button>
              </div>
              <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
                {overviewData.topTrends.map((trend) => (
                  <div key={trend.name} className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">{trend.name}</p>
                      <p className="text-xs text-slate-500">{formatCompact(trend.tweets)} Tweets</p>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${levelColor[trend.level]}`} />
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <p className="text-2xl font-semibold text-slate-800">Sentiment Ratio</p>
              <MisinformationRatioChart data={overviewData.ratioData} />
              <div className="mt-2 flex gap-4 text-xs text-slate-600">
                <p><span className="inline-block h-2 w-2 rounded-full bg-[#9acb3f]" /> Positive</p>
                <p><span className="inline-block h-2 w-2 rounded-full bg-[#f59e0b]" /> Negative</p>
              </div>
              <p className="mt-2 text-xs text-slate-500">Based on sentiment labels from sentiment_analysis_results.</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <p className="text-2xl font-semibold text-slate-800">Topic Clusters</p>
              <TopicClusterChart data={overviewData.clusterData} />
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-8">
              <p className="text-2xl font-semibold text-slate-800">User Location Heat Map</p>
              <div className="mt-4">
                <OverviewLocationMap points={overviewData.heatMapData} />
              </div>
              <p className="mt-3 text-xs text-slate-500">Interactive map from user locations using OpenStreetMap tiles.</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-2">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Signal</p>
                  <p className="mt-1 text-xs text-slate-500">Positive to negative sentiment ratio</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">Live</span>
              </div>
              <AccuracyGauge score={overviewData.accuracyScore} />
              <p className="mt-1 text-sm font-medium text-slate-700">Current signal: {overviewData.accuracyScore}% positive</p>
            </article>

            <article className="rounded-2xl bg-gradient-to-br from-[#2f7f76] to-[#24645e] p-5 text-white xl:col-span-2">
              <p className="text-sm uppercase tracking-[0.2em] text-emerald-100/90">Data Freshness</p>
              <p className="mt-2 text-xl font-semibold">Last Data Scrape</p>
              <p className="mt-4 font-[var(--font-space-grotesk)] text-2xl">{overviewData.lastScrapeLabel}</p>
              <p className="mt-2 text-xs text-emerald-50/90">Source: live ingestion pipeline</p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
