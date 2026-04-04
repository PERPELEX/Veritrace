import { redirect } from "next/navigation";
import { DashboardSettingsClient } from "@/components/dashboard/settings-client";
import { getCurrentSession } from "@/lib/session";

export default async function SettingsPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return <DashboardSettingsClient fullName={session.fullName} role={session.role} />;
}
