"use client";

import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ComputerDesktopIcon,
  ChartPieIcon,
  ClockIcon,
  Cog6ToothIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";
type Props = {
  fullName: string;
  role: string;
};

export function DashboardPowerBiClient({ fullName, role }: Props) {
  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row lg:h-[calc(100dvh-16px)] sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <DashboardSidebar fullName={fullName} role={role} />

        <section className="w-full p-3 sm:p-4 lg:p-6 overflow-y-auto">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm lg:hidden">
            <DashboardMobileNav role={role} />
          </div>

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
