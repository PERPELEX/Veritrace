"use client";

import { DashboardSidebar, DashboardMobileNav } from "@/components/dashboard/dashboard-sidebar";
import { AdminAddUserForm } from "@/components/dashboard/admin-add-user-form";

type Props = {
  fullName: string;
  role: string;
};

export function AdminAddUserClient({ fullName, role }: Props) {
  return (
    <main className="min-h-dvh bg-[#232427] p-0 sm:p-2">
      <section className="mx-auto flex min-h-dvh w-full max-w-none flex-col overflow-hidden rounded-none bg-[#f1f2f4] lg:flex-row lg:h-[calc(100dvh-16px)] sm:min-h-[calc(100dvh-16px)] sm:rounded-2xl">
        <DashboardSidebar fullName={fullName} role={role} />

        <section className="w-full p-3 sm:p-4 lg:p-6 overflow-y-auto">
          <DashboardMobileNav role={role} />

          <header className="rounded-xl border border-slate-200 bg-white px-3 py-3 sm:px-4 mb-4">
            <h2 className="font-[var(--font-space-grotesk)] text-2xl font-semibold text-slate-900 sm:text-3xl">Add User</h2>
            <p className="text-sm text-slate-500">Provision a new account into the system</p>
          </header>

          <div className="flex w-full items-center justify-center p-4">
            <div className="w-full max-w-lg">
              <AdminAddUserForm />
            </div>
          </div>

        </section>
      </section>
    </main>
  );
}
