import { redirect } from "next/navigation";
import { DashboardSearchClient } from "@/components/dashboard/search-client";
import { getSearchPageData } from "@/lib/dashboard-search-data";
import { getCurrentSession } from "@/lib/session";

type SearchPageProps = {
  searchParams?: Promise<{
    q?: string;
    startDate?: string;
    endDate?: string;
    trendName?: string;
    keyword?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const session = await getCurrentSession();
  const resolvedSearchParams = (await searchParams) ?? {};

  if (!session) {
    redirect("/login");
  }

  const searchData = await getSearchPageData({
    query: resolvedSearchParams.q,
    startDate: resolvedSearchParams.startDate,
    endDate: resolvedSearchParams.endDate,
    trendName: resolvedSearchParams.trendName,
    keyword: resolvedSearchParams.keyword,
  });

  return <DashboardSearchClient fullName={session.fullName} searchData={searchData} />;
}
