"use client";

import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  ChartPieIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowLeftIcon,
  ShieldCheckIcon,
  CalendarDaysIcon,
  CircleStackIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { SiteLogo } from "@/components/common/site-logo";

type Props = {
  fullName: string;
};

const sqlDateFormats = [
  "style 126: yyyy-mm-ddThh:mi:ss",
  "style 120: yyyy-mm-dd hh:mi:ss",
  "style 103: dd/mm/yyyy",
  "style 105: dd-mm-yyyy",
  "style 101: mm/dd/yyyy",
  "style 112: yyyymmdd",
];

export function DashboardSettingsClient({ fullName }: Props) {
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
            <Link href="/dashboard/settings" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-white">
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
            <Link href="/dashboard/search" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Search
            </Link>
            <Link href="/dashboard/sentiment" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              Sentiment
            </Link>
            <Link href="/dashboard/about" className="rounded-lg border border-slate-200 px-3 py-2 text-slate-700 transition hover:bg-slate-50">
              About
            </Link>
            <Link href="/dashboard/settings" className="rounded-lg border border-slate-200 bg-slate-100 px-3 py-2 text-slate-800">
              Settings
            </Link>
          </nav>

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System Settings</p>
                <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Data Configuration</h2>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Overview
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              These are the active operational settings currently applied in the dashboard query layer.
            </p>
          </header>

          <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-12">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <div className="flex items-center gap-2">
                <CircleStackIcon className="h-5 w-5 text-emerald-700" />
                <h3 className="text-lg font-semibold text-slate-900">Database</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">Source: SQL Server</p>
              <p className="text-sm text-slate-600">Default catalog: SMIDVS</p>
              <p className="text-sm text-slate-600">Primary trend dataset is active in the SQL layer.</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <div className="flex items-center gap-2">
                <CalendarDaysIcon className="h-5 w-5 text-blue-700" />
                <h3 className="text-lg font-semibold text-slate-900">Date Filter</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">Filter behavior: date-only boundary compare</p>
              <p className="text-sm text-slate-600">Fallback date field: TweetCollectedAt when CreatedAt fails</p>
              <p className="text-sm text-slate-600">UI validation: start date cannot exceed end date</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <div className="flex items-center gap-2">
                <ShieldCheckIcon className="h-5 w-5 text-amber-700" />
                <h3 className="text-lg font-semibold text-slate-900">Auth</h3>
              </div>
              <p className="mt-2 text-sm text-slate-600">Session cookies are httpOnly and scoped to app routes.</p>
              <p className="text-sm text-slate-600">Admin credentials are hashed with bcrypt.</p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-12">
              <h3 className="text-lg font-semibold text-slate-900">Supported SQL Date String Formats</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-3">
                {sqlDateFormats.map((item) => (
                  <p key={item} className="rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">{item}</p>
                ))}
              </div>
              <p className="mt-3 text-xs text-slate-500">
                If your incoming timestamps use another pattern, share a real sample and it can be added immediately.
              </p>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
