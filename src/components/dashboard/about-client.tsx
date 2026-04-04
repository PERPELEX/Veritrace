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
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";

type Props = {
  fullName: string;
  role: string;
};

export function DashboardAboutClient({ fullName, role }: Props) {
  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row lg:h-[calc(100dvh-16px)] sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <DashboardSidebar fullName={fullName} role={role} />

        <section className="w-full p-3 sm:p-4 lg:p-6 overflow-y-auto">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm lg:hidden">
            <DashboardMobileNav role={role} />
          </div>

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500">About VeriTrace</p>
                <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Platform Intelligence</h2>
              </div>
              <Link href="/dashboard" className="inline-flex items-center gap-2 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 transition hover:bg-slate-50">
                <ArrowLeftIcon className="h-4 w-4" />
                Back to Overview
              </Link>
            </div>
            <p className="mt-2 text-sm text-slate-600">
              VeriTrace monitors social discourse in near real-time and turns raw tweet streams into operational intelligence for analysis teams.
            </p>
          </header>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-12">
            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <h3 className="text-xl font-semibold text-slate-900">Mission</h3>
              <p className="mt-2 text-sm text-slate-600">
                Detect and track misinformation amplification patterns before they impact decision-making.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <h3 className="text-xl font-semibold text-slate-900">Data Pipeline</h3>
              <p className="mt-2 text-sm text-slate-600">
                SQL Server tables ingest trend tweets, clustering outputs, and user-location signals for dashboard and BI layers.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-4">
              <h3 className="text-xl font-semibold text-slate-900">Security</h3>
              <p className="mt-2 text-sm text-slate-600">
                Role-based admin access backed by hashed credentials in a dedicated AdminLogin table.
              </p>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-6">
              <h3 className="text-xl font-semibold text-slate-900">Key Capabilities</h3>
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600">
                <li>Trend spike detection with date-range filtering</li>
                <li>Cluster volume distribution and topic focus tracking</li>
                <li>User location heat analysis for regional impact</li>
                <li>Embedded Power BI for leadership reporting</li>
              </ul>
            </article>

            <article className="rounded-2xl border border-slate-200 bg-white p-5 xl:col-span-6">
              <h3 className="text-xl font-semibold text-slate-900">Current Stack</h3>
              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-700 sm:grid-cols-2">
                <p className="rounded-lg bg-slate-100 px-3 py-2">Next.js 16 + React 19</p>
                <p className="rounded-lg bg-slate-100 px-3 py-2">SQL Server (SMIDVS)</p>
                <p className="rounded-lg bg-slate-100 px-3 py-2">Recharts + Leaflet</p>
                <p className="rounded-lg bg-slate-100 px-3 py-2">Power BI Embedded</p>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
