import { redirect } from "next/navigation";
import { DashboardSentimentClient } from "@/components/dashboard/sentiment-client";
import { getSentimentPageData } from "@/lib/dashboard-sentiment-data";
import { getCurrentSession } from "@/lib/session";

type SentimentPageProps = {
  searchParams?: Promise<{
    startDate?: string;
    endDate?: string;
    trendName?: string;
  }>;
};

export default async function SentimentPage({ searchParams }: SentimentPageProps) {
  const session = await getCurrentSession();
  const resolvedSearchParams = (await searchParams) ?? {};

  if (!session) {
    redirect("/");
  }

  const sentimentData = await getSentimentPageData({
    startDate: resolvedSearchParams.startDate,
    endDate: resolvedSearchParams.endDate,
    trendName: resolvedSearchParams.trendName,
  });

  return <DashboardSentimentClient fullName={session.fullName} role={session.role} sentimentData={sentimentData} />;
}
