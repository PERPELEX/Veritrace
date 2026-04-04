import { redirect } from "next/navigation";
import { DashboardTrendClient } from "@/components/dashboard/trend-client";
import { getTrendPageData } from "@/lib/dashboard-trend-data";
import { getCurrentSession } from "@/lib/session";

type TrendPageProps = {
  searchParams?: Promise<{
    startDate?: string;
    endDate?: string;
    trendName?: string;
  }>;
};

export default async function TrendPage({ searchParams }: TrendPageProps) {
  const session = await getCurrentSession();
  const resolvedSearchParams = (await searchParams) ?? {};

  if (!session) {
    redirect("/");
  }

  const trendData = await getTrendPageData({
    startDate: resolvedSearchParams.startDate,
    endDate: resolvedSearchParams.endDate,
    trendName: resolvedSearchParams.trendName,
  });

  return <DashboardTrendClient fullName={session.fullName} role={session.role} trendData={trendData} />;
}
