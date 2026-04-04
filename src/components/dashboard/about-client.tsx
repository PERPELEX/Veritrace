"use client";

import {
  ShieldCheckIcon,
  SparklesIcon,
  CpuChipIcon,
  UserGroupIcon,
  WindowIcon,
  ArrowLeftIcon,
  CommandLineIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";
import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";

type Props = {
  fullName: string;
  role: string;
};

export function DashboardAboutClient({ fullName, role }: Props) {
  return (
    <main className="min-h-dvh bg-[#0a1020] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f4f7f9] lg:flex-row lg:h-[calc(100dvh-16px)] sm:min-h-[calc(100dvh-16px)] sm:rounded-3xl shadow-2xl">
        <DashboardSidebar fullName={fullName} role={role} />

        <section className="w-full p-4 lg:p-8 overflow-y-auto">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm lg:hidden">
            <DashboardMobileNav role={role} />
          </div>

          {/* Hero Section */}
          <header className="relative overflow-hidden rounded-[2.5rem] bg-[#0a1020] text-white shadow-2xl">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />
            <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[#84cc16] blur-[100px] opacity-20" />
            <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-[#16a34a] blur-[100px] opacity-20" />

            <div className="relative z-10 p-8 lg:p-12">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="fade-slide">
                  <div className="inline-flex items-center gap-2 rounded-full bg-[#84cc16]/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#84cc16] mb-3">
                    Knowledge Base
                  </div>
                  <h2 className="font-[var(--font-space-grotesk)] text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl text-white">
                    Platform Intelligence
                  </h2>
                  <p className="mt-4 max-w-2xl text-lg text-slate-400 font-light leading-relaxed">
                    VeriTrace monitors social discourse in near real-time, transforming raw digital signals into actionable operational intelligence for modern analysis teams.
                  </p>
                </div>
                
                <Link 
                  href="/dashboard" 
                  className="group flex h-fit items-center gap-2 self-start rounded-2xl border border-white/10 bg-white/5 px-6 py-3.5 text-sm font-medium transition-all hover:bg-white/10 hover:border-white/20 active:scale-95"
                >
                  <ArrowLeftIcon className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                  Back to Overview
                </Link>
              </div>
            </div>
          </header>

          {/* Key Missions & Capabilities */}
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[
              {
                title: "Our Mission",
                desc: "Detecting and tracking misinformation amplification patterns before they impact critical global decision-making.",
                icon: ShieldCheckIcon,
                color: "text-blue-500",
                bg: "bg-blue-50",
                delay: "delay-1"
              },
              {
                title: "Data Pipeline",
                desc: "Ingesting massive trend datasets, clustering outputs, and socio-geographic signals for high-fidelity visualization.",
                icon: CommandLineIcon,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                delay: "delay-2"
              },
              {
                title: "Strategic Security",
                desc: "Enterprise-grade role-based access management ensuring sensitive data remains in the hands of authorized personnel.",
                icon: SparklesIcon,
                color: "text-amber-500",
                bg: "bg-amber-50",
                delay: "delay-3"
              }
            ].map((item, idx) => (
              <article 
                key={idx} 
                className={`fade-slide ${item.delay} group relative overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 transition-all hover:border-[#84cc16]/50 hover:shadow-2xl hover:shadow-[#84cc16]/5`}
              >
                <div className={`mb-6 p-4 w-fit rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                  <item.icon className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {item.desc}
                </p>
              </article>
            ))}
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            {/* Capabilities */}
            <article className="fade-slide delay-1 rounded-[2.5rem] border border-slate-200 bg-white p-8 lg:col-span-12 xl:col-span-7">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl">
                  <CpuChipIcon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 text-pretty">Key Capabilities</h3>
              </div>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                {[
                  { label: "Trend Spike Detection", sub: "Real-time date-range filtering" },
                  { label: "Cluster Analysis", sub: "Topic focus and volume tracking" },
                  { label: "Regional Insight", sub: "User location heat analysis" },
                  { label: "Advanced Reporting", sub: "Embedded Power BI analytics" }
                ].map((cap, i) => (
                  <li key={i} className="flex gap-4 group">
                    <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-50 text-[#84cc16] group-hover:bg-[#84cc16] group-hover:text-white transition-colors">
                      <BoltIcon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{cap.label}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{cap.sub}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </article>

            {/* Current Stack */}
            <article className="fade-slide delay-2 rounded-[2.5rem] bg-[#0a1020] p-8 text-white lg:col-span-12 xl:col-span-5 border border-white/5">
              <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-white/5 text-[#84cc16] rounded-2xl border border-white/10">
                  <CommandLineIcon className="h-6 w-6" />
                </div>
                <h3 className="text-2xl font-bold">Tech Ecosystem</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: "Frontend", tech: "Next.js 16 + React 19" },
                  { name: "Database", tech: "SQL Server (M6)" },
                  { name: "Visuals", tech: "Recharts + GSAP" },
                  { name: "Enterprise", tech: "Power BI Integration" }
                ].map((item, i) => (
                  <div key={i} className="rounded-2xl bg-white/5 p-4 border border-white/5 hover:border-white/10 transition-colors">
                    <p className="text-[10px] uppercase tracking-widest text-[#84cc16] mb-1 font-semibold">{item.name}</p>
                    <p className="text-sm font-medium text-slate-300">{item.tech}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#84cc16]/20 to-transparent border border-[#84cc16]/20">
                <div className="flex items-center gap-3">
                  <WindowIcon className="h-5 w-5 text-[#84cc16]" />
                  <span className="text-xs font-medium text-slate-400">Environment Ready</span>
                </div>
                <div className="flex gap-1">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-1 w-1 rounded-full bg-[#84cc16]" />
                  ))}
                </div>
              </div>
            </article>
          </div>
        </section>
      </section>
    </main>
  );
}
