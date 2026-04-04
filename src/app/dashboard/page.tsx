import { redirect } from "next/navigation";
import { DashboardOverviewClient } from "@/components/dashboard/overview-client";
import { getDashboardOverviewData } from "@/lib/dashboard-overview-data";
import { getCurrentSession } from "@/lib/session";

type DashboardPageProps = {
  searchParams?: Promise<{
    startDate?: string;
    endDate?: string;
  }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await getCurrentSession();
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedStartDate = resolvedSearchParams.startDate ?? "";
  const selectedEndDate = resolvedSearchParams.endDate ?? "";

  if (!session) {
    redirect("/");
  }

  const overviewData = await getDashboardOverviewData({
    startDate: selectedStartDate,
    endDate: selectedEndDate,
  });

  return (
    <DashboardOverviewClient
      role={session.role}
      fullName={session.fullName}
      overviewData={overviewData}
      selectedStartDate={selectedStartDate}
      selectedEndDate={selectedEndDate}
    />
  );
}
