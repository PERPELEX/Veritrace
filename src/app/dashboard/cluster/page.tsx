import { redirect } from "next/navigation";
import { DashboardClusterClient } from "@/components/dashboard/cluster-client";
import { getClusterPageData } from "@/lib/dashboard-cluster-data";
import { getCurrentSession } from "@/lib/session";

type ClusterPageProps = {
  searchParams?: Promise<{
    startDate?: string;
    endDate?: string;
    trendName?: string;
  }>;
};

export default async function ClusterPage({ searchParams }: ClusterPageProps) {
  const session = await getCurrentSession();
  const resolvedSearchParams = (await searchParams) ?? {};

  if (!session) {
    redirect("/login");
  }

  const clusterData = await getClusterPageData({
    startDate: resolvedSearchParams.startDate,
    endDate: resolvedSearchParams.endDate,
    trendName: resolvedSearchParams.trendName,
  });

  return <DashboardClusterClient fullName={session.fullName} clusterData={clusterData} />;
}
