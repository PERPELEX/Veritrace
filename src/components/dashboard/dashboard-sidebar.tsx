"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import { logoutUser } from "@/store/slices/authSlice";
import { AppDispatch, RootState } from "@/store/store";
import { SiteLogo } from "@/components/common/site-logo";
import {
  ChartBarSquareIcon,
  GlobeAltIcon,
  ComputerDesktopIcon,
  MagnifyingGlassIcon,
  ChartPieIcon,
  Squares2X2Icon,
  ClockIcon,
  Cog6ToothIcon,
  UsersIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/outline";

type Props = {
  fullName: string;
  role?: string;
};

export function DashboardSidebar({ fullName, role }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const [loadingLogout, setLoadingLogout] = useState(false);

  const onLogout = async () => {
    setLoadingLogout(true);
    await dispatch(logoutUser());
    router.push("/login");
  };

  const navLinks = [
    { name: "Overview", href: "/dashboard", icon: ChartBarSquareIcon },
    { name: "Trends", href: "/dashboard/trend", icon: GlobeAltIcon },
    { name: "Power BI", href: "/dashboard/powerbi", icon: ComputerDesktopIcon },
    { name: "Clusters", href: "/dashboard/cluster", icon: Squares2X2Icon },
    { name: "Search", href: "/dashboard/search", icon: MagnifyingGlassIcon },
    { name: "Sentiment", href: "/dashboard/sentiment", icon: ChartPieIcon },
  ];

  const generalLinks = [
    { name: "About", href: "/dashboard/about", icon: ClockIcon },
    { name: "Settings", href: "/dashboard/settings", icon: Cog6ToothIcon },
  ];

  const adminLinks = [
    { name: "Manage Users", href: "/dashboard/admin/users", icon: UsersIcon },
    { name: "Add User", href: "/dashboard/admin/add-user", icon: UsersIcon },
  ];

  const renderLink = (item: { name: string; href: string; icon: any }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;
    return (
      <Link
        key={item.name}
        href={item.href}
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition ${
          isActive
            ? "bg-white/10 text-white"
            : "text-emerald-50/90 hover:bg-white/8"
        }`}
      >
        <Icon className="h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <aside className="hidden w-[260px] shrink-0 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden bg-gradient-to-b from-[#00130f] via-[#003526] to-[#00120f] px-6 py-8 text-white lg:flex lg:flex-col">
      <SiteLogo className="h-20 w-auto" width={300} height={100} />
      
      <p className="mt-10 text-sm uppercase tracking-[0.22em] text-emerald-100/70">Menu</p>
      <nav className="mt-4 space-y-2 text-[18px]">
        {navLinks.map(renderLink)}
      </nav>

      <div className="my-8 border-t border-emerald-100/20" />
      
      <p className="text-sm uppercase tracking-[0.22em] text-emerald-100/70">General</p>
      <nav className="mt-4 space-y-2 text-[18px]">
        {generalLinks.map(renderLink)}
      </nav>

      {role === "admin" && (
        <>
          <div className="my-8 border-t border-emerald-100/20" />
          <p className="text-sm uppercase tracking-[0.22em] text-emerald-100/70">Administrator</p>
          <nav className="mt-4 space-y-2 text-[18px]">
            {adminLinks.map(renderLink)}
          </nav>
        </>
      )}

      <div className="mt-5 border-t border-emerald-100/20 pt-5">
        <p className="mb-2 text-xs uppercase tracking-[0.18em] text-emerald-100/70">Signed In</p>
        <p className="text-sm text-white/90">{fullName}</p>
        <button
          className="mt-3 inline-flex w-full text-center flex justify-center items-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 text-sm text-red-100 transition hover:bg-red-500/30"
          onClick={onLogout}
          disabled={loadingLogout}
        >
          <ArrowRightStartOnRectangleIcon className="h-4 w-4" />
          {loadingLogout ? "Signing out..." : "Sign out"}
        </button>
      </div>
    </aside>
  );
}

export function DashboardMobileNav({ role }: { role?: string }) {
  const pathname = usePathname();

  const links = [
    { name: "Overview", href: "/dashboard" },
    { name: "Trends", href: "/dashboard/trend" },
    { name: "Power BI", href: "/dashboard/powerbi" },
    { name: "Clusters", href: "/dashboard/cluster" },
    { name: "Search", href: "/dashboard/search" },
    { name: "Sentiment", href: "/dashboard/sentiment" },
    { name: "About", href: "/dashboard/about" },
    { name: "Settings", href: "/dashboard/settings" },
  ];

  if (role === "admin") {
    links.push({ name: "Manage Users", href: "/dashboard/admin/users" });
    links.push({ name: "Add User", href: "/dashboard/admin/add-user" });
  }

  return (
    <nav className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white p-2 text-sm lg:hidden">
      {links.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.name}
            href={item.href}
            className={`rounded-lg px-3 py-2 transition ${
              isActive
                ? "bg-slate-100 text-slate-800 border border-slate-200"
                : "text-slate-700 hover:bg-slate-50 border border-transparent"
            }`}
          >
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
