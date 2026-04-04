"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
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
  ChartPieIcon,
  Squares2X2Icon,
  ClockIcon,
  Cog6ToothIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteLogo } from "@/components/common/site-logo";
import type { SearchPageData } from "@/lib/dashboard-search-data";

type Props = {
  fullName: string;
  searchData: SearchPageData;
};

const TWEETS_PER_PAGE = 25;

function formatCompact(n: number) {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000)}K`;
  }
  return String(n);
}

export function DashboardSearchClient({ fullName, searchData }: Props) {
  const router = useRouter();
  const [chartsReady, setChartsReady] = useState(false);

  const [query, setQuery] = useState(searchData.query);
  const [startDate, setStartDate] = useState(searchData.selectedStartDate);
  const [endDate, setEndDate] = useState(searchData.selectedEndDate);
  const [trendName, setTrendName] = useState(searchData.selectedTrendName);
  const [keyword, setKeyword] = useState(searchData.selectedKeyword);
  const [filterError, setFilterError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setChartsReady(true);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchData.tweets]);

  const hasFilterChanges = useMemo(
    () =>
      query !== searchData.query ||
      startDate !== searchData.selectedStartDate ||
      endDate !== searchData.selectedEndDate ||
      trendName !== searchData.selectedTrendName ||
      keyword !== searchData.selectedKeyword,
    [
      query,
      startDate,
      endDate,
      trendName,
      keyword,
      searchData.query,
      searchData.selectedStartDate,
      searchData.selectedEndDate,
      searchData.selectedTrendName,
      searchData.selectedKeyword,
    ],
  );

  const totalPages = Math.max(1, Math.ceil(searchData.tweets.length / TWEETS_PER_PAGE));
  const pagedTweets = searchData.tweets.slice(
    (currentPage - 1) * TWEETS_PER_PAGE,
    currentPage * TWEETS_PER_PAGE,
  );
  const hasActiveUserSearch = Boolean(searchData.query.trim());

  const applyFilters = () => {
    if (startDate && endDate && startDate > endDate) {
      setFilterError("Start date cannot be after end date.");
      return;
    }

    setFilterError("");
    const params = new URLSearchParams();
    const trimmedQuery = query.trim();
    if (trimmedQuery) {
      params.set("q", trimmedQuery);
    }
    if (startDate) {
      params.set("startDate", startDate);
    }
    if (endDate) {
      params.set("endDate", endDate);
    }
    if (trendName) {
      params.set("trendName", trendName);
    }
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    const queryString = params.toString();
    router.push(queryString ? `/dashboard/search?${queryString}` : "/dashboard/search");
    router.refresh();
  };

  const clearFilters = () => {
    setQuery("");
    setStartDate("");
    setEndDate("");
    setTrendName("");
    setKeyword("");
    setFilterError("");
    router.push("/dashboard/search");
    router.refresh();
  };

  const openUserFromRanking = (screenName: string) => {
    const normalized = screenName.trim();
    if (!normalized) {
      return;
    }

    const params = new URLSearchParams();
    params.set("q", normalized);
    if (startDate) {
      params.set("startDate", startDate);
    }
    if (endDate) {
      params.set("endDate", endDate);
    }
    if (trendName) {
      params.set("trendName", trendName);
    }
    if (keyword.trim()) {
      params.set("keyword", keyword.trim());
    }

    setQuery(normalized);
    const queryString = params.toString();
    router.push(`/dashboard/search?${queryString}`);
    router.refresh();
  };

  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row lg:h-[calc(100dvh-16px)] sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <aside className="hidden w-[260px] shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-gradient-to-b from-[#00130f] via-[#003526] to-[#00120f] px-6 py-8 text-white lg:flex lg:flex-col">
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
            <Link href="/dashboard/search" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-white">
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

        <section className="w-full p-3 sm:p-4 lg:p-6 overflow-y-auto">
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
            <Link href="/dashboard/search" className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-800">
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

          {searchData.warning ? (
            <div className="mb-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {searchData.warning}
            </div>
          ) : null}

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">User Intelligence Search</h2>
            <p className="text-sm text-slate-500">Find account details, tweet feed, and activity analytics</p>
            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-6">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Screen name (e.g. @user)"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 sm:col-span-2 xl:col-span-2"
              />
              <input
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700"
              />
              <input
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700"
              />
              <select
                value={trendName}
                onChange={(event) => setTrendName(event.target.value)}
                className="rounded-md border border-slate-300 bg-white px-2 py-2 text-xs text-slate-700"
              >
                <option value="">All Trends</option>
                {searchData.availableTrends.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Keyword in tweets"
                className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 sm:col-span-2 xl:col-span-1"
              />
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <button
                onClick={applyFilters}
                disabled={!hasFilterChanges}
                className="rounded-md bg-slate-900 px-3 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Apply
              </button>
              <button
                onClick={clearFilters}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700"
              >
                Clear
              </button>
            </div>
            {filterError ? <p className="mt-2 text-xs text-red-600">{filterError}</p> : null}
          </header>

          {!hasActiveUserSearch ? (
            <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-lg font-semibold text-slate-800">Most Active Users</p>
                <p className="text-xs text-slate-500">Highest to lowest tweet count</p>
              </div>
              {searchData.userRanking.length ? (
                <div className="mt-3 overflow-x-auto">
                  <table className="min-w-full border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-2 py-2">Rank</th>
                        <th className="px-2 py-2">Screen Name</th>
                        <th className="px-2 py-2">User Name</th>
                        <th className="px-2 py-2">Tweets</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchData.userRanking.map((user, index) => (
                        <tr key={`${user.screenName}-${index}`} className="border-b border-slate-100 text-slate-700">
                          <td className="px-2 py-2 font-medium">#{index + 1}</td>
                          <td className="px-2 py-2 whitespace-nowrap font-semibold">
                            <button
                              onClick={() => openUserFromRanking(user.screenName)}
                              className="rounded-md px-2 py-1 text-left text-emerald-700 transition hover:bg-emerald-50 hover:text-emerald-900"
                              title={`Open ${user.screenName}`}
                            >
                              {user.screenName}
                            </button>
                          </td>
                          <td className="px-2 py-2">{user.userName}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{formatCompact(user.tweetCount)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No user ranking data found for the selected filters.</p>
              )}
            </article>
          ) : null}

          {searchData.profile ? (
            <>
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 lg:col-span-2">
                  <p className="flex items-center gap-2 text-sm uppercase tracking-[0.18em] text-slate-500">
                    <UserCircleIcon className="h-5 w-5" />
                    Account
                  </p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">{searchData.profile.screenName}</p>
                  <p className="mt-1 text-sm text-slate-600">{searchData.profile.userLocation}</p>
                  <p className="mt-1 text-xs text-slate-500">Last updated: {searchData.profile.lastUpdated}</p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Total Tweets</p>
                  <p className="mt-3 font-[var(--font-space-grotesk)] text-3xl font-semibold text-slate-900 sm:text-4xl">
                    {formatCompact(searchData.profile.totalTweets)}
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Unique Trends</p>
                  <p className="mt-3 font-[var(--font-space-grotesk)] text-3xl font-semibold text-slate-900 sm:text-4xl">
                    {searchData.profile.uniqueTrends}
                  </p>
                </article>
                <article className="rounded-2xl border border-slate-200 bg-white p-5">
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Active Days</p>
                  <p className="mt-3 font-[var(--font-space-grotesk)] text-3xl font-semibold text-slate-900 sm:text-4xl">
                    {searchData.profile.activeDays}
                  </p>
                </article>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
                <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-7">
                  <p className="text-xl font-semibold text-slate-800">Daily Tweet Activity</p>
                  <p className="text-xs text-slate-500">{searchData.profile.firstTweetAt} to {searchData.profile.latestTweetAt}</p>
                  <div className="mt-3 h-64 w-full min-w-0 overflow-hidden sm:h-72">
                    {chartsReady ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                        <LineChart data={searchData.dailyVolume}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="dayLabel" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(value) => [`${formatCompact(Number(value))} tweets`, "Volume"]}
                            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                          />
                          <Line type="monotone" dataKey="tweetCount" stroke="#2f7f76" strokeWidth={2.5} dot={{ r: 3 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full rounded-xl bg-slate-100" />
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-5">
                  <p className="text-xl font-semibold text-slate-800">Tweets by Hour (UTC)</p>
                  <div className="mt-3 h-64 w-full min-w-0 overflow-hidden sm:h-72">
                    {chartsReady ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                        <BarChart data={searchData.hourlyVolume}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="hourLabel" tick={{ fontSize: 10, fill: "#334155" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                          <Tooltip
                            formatter={(value) => [`${formatCompact(Number(value))} tweets`, "Volume"]}
                            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                          />
                          <Bar dataKey="tweetCount" fill="#9acb3f" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full rounded-xl bg-slate-100" />
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-12">
                  <p className="text-xl font-semibold text-slate-800">Top Trend Distribution</p>
                  <div className="mt-3 h-64 w-full min-w-0 overflow-hidden sm:h-72">
                    {chartsReady ? (
                      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                        <BarChart data={searchData.trendDistribution} layout="vertical" margin={{ left: 24 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                          <XAxis type="number" tick={{ fontSize: 12, fill: "#334155" }} axisLine={false} tickLine={false} />
                          <YAxis
                            type="category"
                            dataKey="trendName"
                            tick={{ fontSize: 12, fill: "#334155" }}
                            axisLine={false}
                            tickLine={false}
                            width={120}
                          />
                          <Tooltip
                            formatter={(value) => [`${formatCompact(Number(value))} tweets`, "Volume"]}
                            contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12 }}
                          />
                          <Bar dataKey="tweetCount" fill="#f59e0b" radius={[0, 8, 8, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full w-full rounded-xl bg-slate-100" />
                    )}
                  </div>
                </article>
              </div>

              <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="mb-2 text-sm text-slate-500">Tweet Feed ({searchData.tweets.length} rows)</p>
                <div className="overflow-x-auto">
                  <table className="min-w-[860px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-[0.12em] text-slate-500">
                        <th className="px-2 py-2">Time</th>
                        <th className="px-2 py-2">Trend</th>
                        <th className="px-2 py-2">Tweet</th>
                        <th className="px-2 py-2">Source</th>
                        <th className="px-2 py-2">RT</th>
                        <th className="px-2 py-2">Fav</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pagedTweets.map((row) => (
                        <tr key={`${row.tweetId}-${row.createdAt}`} className="border-b border-slate-100 text-sm text-slate-700 align-top">
                          <td className="px-2 py-2 whitespace-nowrap">{row.createdAt}</td>
                          <td className="px-2 py-2 whitespace-nowrap font-medium">{row.trendName}</td>
                          <td className="px-2 py-2 min-w-[280px] sm:min-w-[420px]">
                            <p className="line-clamp-3">{row.tweetText || "No tweet text available."}</p>
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">{row.source}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{row.retweetCount}</td>
                          <td className="px-2 py-2 whitespace-nowrap">{row.favoriteCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">Page {currentPage} of {totalPages}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                      disabled={currentPage === 1}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Prev
                    </button>
                    <button
                      onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                      disabled={currentPage === totalPages}
                      className="rounded-md border border-slate-300 px-3 py-1 text-xs text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </article>
            </>
          ) : (
            <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
              {hasActiveUserSearch
                ? "No matching user details found for the searched handle."
                : "Enter a user handle and click Apply to load account details, graphs, and tweet feed."}
            </article>
          )}
        </section>
      </section>
    </main>
  );
}
