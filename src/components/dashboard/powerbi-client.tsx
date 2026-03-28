"use client";

import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  ClockIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { SiteLogo } from "@/components/common/site-logo";

type Props = {
  fullName: string;
};

export function DashboardPowerBiClient({ fullName }: Props) {
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
            <Link href="/dashboard/powerbi" className="flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-white">
              <ComputerDesktopIcon className="h-5 w-5" />
              Power BI
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
          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Power BI Dashboard</h2>
            <p className="text-sm text-slate-500">Embedded analytics report</p>
          </header>

          <article className="mt-4 rounded-2xl border border-slate-200 bg-white p-3">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
              <iframe
                title="FYP- Power BI Main Report 15-03-2026"
                src="https://app.powerbi.com/reportEmbed?reportId=d909a821-5204-47fb-87b6-b7e6d9019307&autoAuth=true&ctid=1511ab2e-502b-4e2d-bd68-f679f549b5a2"
                className="h-[70vh] min-h-[420px] w-full sm:h-[76vh] sm:min-h-[520px]"
                frameBorder="0"
                allowFullScreen
              />
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
