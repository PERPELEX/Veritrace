import { redirect } from "next/navigation";
import { DashboardAboutClient } from "@/components/dashboard/about-client";
import { getCurrentSession } from "@/lib/session";

export default async function AboutPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/");
  }

  return <DashboardAboutClient fullName={session.fullName} role={session.role} />;
}
