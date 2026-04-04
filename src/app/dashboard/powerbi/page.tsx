import { redirect } from "next/navigation";
import { DashboardPowerBiClient } from "@/components/dashboard/powerbi-client";
import { getCurrentSession } from "@/lib/session";

export default async function PowerBiPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return <DashboardPowerBiClient fullName={session.fullName} role={session.role} />;
}
