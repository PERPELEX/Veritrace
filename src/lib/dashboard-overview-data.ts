import { getSqlPool } from "@/lib/db";
import { ClusterPoint, HeatMapPoint, OverviewData, RatioPoint, SentimentPoint, TopTrend } from "@/lib/dashboard-types";

type CountRow = {
  totalTweets: number;
  lastScrape: Date | string | null;
  minCreated: Date | string | null;
  maxCreated: Date | string | null;
};

type TrendCountRow = {
  trendName: string;
  tweetCount: number;
};

type SurgingRow = {
  trendName: string;
  tweetCount: number;
};

type ClusterRow = {
  clusterName: string;
  tweetCount: number;
};

type LocationRow = {
  location: string;
  tweetCount: number;
};

type OverviewFilterOptions = {
  startDate?: string;
  endDate?: string;
};

function formatCompact(n: number) {
  if (n >= 1000000) {
    return `${(n / 1000000).toFixed(1)}M`;
  }
  if (n >= 1000) {
    return `${Math.round(n / 1000)}K`;
  }
  return String(n);
}

function parseSqlDate(value: Date | string | null) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeDateInput(value?: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return null;
  }

  return trimmed;
}

function formatDate(value: Date | string | null) {
  const parsedValue = parseSqlDate(value);

  if (!parsedValue) {
    return "N/A";
  }

  if (!value) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedValue);
}

function formatDateTime(value: Date | string | null) {
  const parsedValue = parseSqlDate(value);

  if (!parsedValue) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsedValue);
}

function safeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return 0;
    }

    const asNumber = Number(trimmed);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }

  return 0;
}

function fallbackOverviewData(message: string): OverviewData {
  return {
    totalTweets: 0,
    totalTweetsLabel: "0",
    dateRangeLabel: "No data window",
    lastScrapeLabel: "N/A",
    surgingTrends: ["No trend data", "No trend data"],
    sentimentData: [
      { name: "Verified", value: 0, color: "#8fce00" },
      { name: "Misinformation", value: 0, color: "#f59e0b" },
      { name: "Neutral", value: 0, color: "#2f7f76" },
    ],
    ratioData: [],
    clusterData: [],
    heatMapData: [],
    topTrends: [],
    accuracyScore: 0,
    dataWarning: message,
  };
}

function toHeatLevel(tweetCount: number, maxCount: number): "low" | "medium" | "high" {
  if (maxCount <= 0) {
    return "low";
  }

  const ratio = tweetCount / maxCount;
  if (ratio >= 0.67) {
    return "high";
  }
  if (ratio >= 0.34) {
    return "medium";
  }
  return "low";
}

export async function getDashboardOverviewData(filters?: OverviewFilterOptions): Promise<OverviewData> {
  try {
    const pool = await getSqlPool();
    const startDate = normalizeDateInput(filters?.startDate);
    const endDate = normalizeDateInput(filters?.endDate);

    const startDateBoundary = startDate ?? null;
    const endDateBoundary = endDate ?? null;

    const countResult = await pool
      .request()
      .input("startDate", startDateBoundary)
      .input("endDate", endDateBoundary)
      .query<CountRow>(`
      WITH parsed AS (
        SELECT
          COALESCE(
            TRY_CONVERT(datetime2, TweetCollectedAt, 126),
            TRY_CONVERT(datetime2, TweetCollectedAt, 120),
            TRY_CONVERT(datetime2, TweetCollectedAt, 103),
            TRY_CONVERT(datetime2, TweetCollectedAt, 105),
            TRY_CAST(TweetCollectedAt AS datetime2)
          ) AS parsedTweetCollectedAt,
          COALESCE(
            TRY_CONVERT(datetime2, CreatedAt, 126),
            TRY_CONVERT(datetime2, CreatedAt, 120),
            TRY_CONVERT(datetime2, CreatedAt, 103),
            TRY_CONVERT(datetime2, CreatedAt, 105),
            TRY_CONVERT(datetime2, CreatedAt, 101),
            TRY_CONVERT(datetime2, CreatedAt, 112),
            TRY_CAST(CreatedAt AS datetime2)
          ) AS parsedCreatedAt,
          COALESCE(
            TRY_CONVERT(datetime2, CreatedAt, 126),
            TRY_CONVERT(datetime2, CreatedAt, 120),
            TRY_CONVERT(datetime2, CreatedAt, 103),
            TRY_CONVERT(datetime2, CreatedAt, 105),
            TRY_CONVERT(datetime2, CreatedAt, 101),
            TRY_CONVERT(datetime2, CreatedAt, 112),
            TRY_CAST(CreatedAt AS datetime2),
            TRY_CONVERT(datetime2, TweetCollectedAt, 126),
            TRY_CONVERT(datetime2, TweetCollectedAt, 120),
            TRY_CONVERT(datetime2, TweetCollectedAt, 103),
            TRY_CONVERT(datetime2, TweetCollectedAt, 105),
            TRY_CONVERT(datetime2, TweetCollectedAt, 101),
            TRY_CONVERT(datetime2, TweetCollectedAt, 112),
            TRY_CAST(TweetCollectedAt AS datetime2)
          ) AS parsedFilterDate
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT
        COUNT_BIG(1) AS totalTweets,
        MAX(parsedTweetCollectedAt) AS lastScrape,
        MIN(parsedCreatedAt) AS minCreated,
        MAX(parsedCreatedAt) AS maxCreated
      FROM parsed
      WHERE (@startDate IS NULL OR CAST(parsedFilterDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedFilterDate AS date) <= TRY_CAST(@endDate AS date))
    `);

    const trendCountsResult = await pool
      .request()
      .input("startDate", startDateBoundary)
      .input("endDate", endDateBoundary)
      .query<TrendCountRow>(`
      WITH parsed AS (
        SELECT
          TrendName,
          COALESCE(
            TRY_CONVERT(datetime2, CreatedAt, 126),
            TRY_CONVERT(datetime2, CreatedAt, 120),
            TRY_CONVERT(datetime2, CreatedAt, 103),
            TRY_CONVERT(datetime2, CreatedAt, 105),
            TRY_CONVERT(datetime2, CreatedAt, 101),
            TRY_CONVERT(datetime2, CreatedAt, 112),
            TRY_CAST(CreatedAt AS datetime2)
          ) AS parsedCreatedAt,
          COALESCE(
            TRY_CONVERT(datetime2, CreatedAt, 126),
            TRY_CONVERT(datetime2, CreatedAt, 120),
            TRY_CONVERT(datetime2, CreatedAt, 103),
            TRY_CONVERT(datetime2, CreatedAt, 105),
            TRY_CONVERT(datetime2, CreatedAt, 101),
            TRY_CONVERT(datetime2, CreatedAt, 112),
            TRY_CAST(CreatedAt AS datetime2),
            TRY_CONVERT(datetime2, TweetCollectedAt, 126),
            TRY_CONVERT(datetime2, TweetCollectedAt, 120),
            TRY_CONVERT(datetime2, TweetCollectedAt, 103),
            TRY_CONVERT(datetime2, TweetCollectedAt, 105),
            TRY_CONVERT(datetime2, TweetCollectedAt, 101),
            TRY_CONVERT(datetime2, TweetCollectedAt, 112),
            TRY_CAST(TweetCollectedAt AS datetime2)
          ) AS parsedFilterDate
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT TOP (10)
        TrendName AS trendName,
        COUNT_BIG(1) AS tweetCount
      FROM parsed
      WHERE (@startDate IS NULL OR CAST(parsedFilterDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedFilterDate AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY TrendName
      ORDER BY COUNT_BIG(1) DESC
    `);

    const surgingResult = await pool
      .request()
      .input("startDate", startDateBoundary)
      .input("endDate", endDateBoundary)
      .query<SurgingRow>(`
      WITH parsed AS (
        SELECT
          TrendName,
          COALESCE(
            TRY_CONVERT(datetime2, CreatedAt, 126),
            TRY_CONVERT(datetime2, CreatedAt, 120),
            TRY_CONVERT(datetime2, CreatedAt, 103),
            TRY_CONVERT(datetime2, CreatedAt, 105),
            TRY_CONVERT(datetime2, CreatedAt, 101),
            TRY_CONVERT(datetime2, CreatedAt, 112),
            TRY_CAST(CreatedAt AS datetime2)
          ) AS parsedCreatedAt,
          COALESCE(
            TRY_CONVERT(datetime2, CreatedAt, 126),
            TRY_CONVERT(datetime2, CreatedAt, 120),
            TRY_CONVERT(datetime2, CreatedAt, 103),
            TRY_CONVERT(datetime2, CreatedAt, 105),
            TRY_CONVERT(datetime2, CreatedAt, 101),
            TRY_CONVERT(datetime2, CreatedAt, 112),
            TRY_CAST(CreatedAt AS datetime2),
            TRY_CONVERT(datetime2, TweetCollectedAt, 126),
            TRY_CONVERT(datetime2, TweetCollectedAt, 120),
            TRY_CONVERT(datetime2, TweetCollectedAt, 103),
            TRY_CONVERT(datetime2, TweetCollectedAt, 105),
            TRY_CONVERT(datetime2, TweetCollectedAt, 101),
            TRY_CONVERT(datetime2, TweetCollectedAt, 112),
            TRY_CAST(TweetCollectedAt AS datetime2)
          ) AS parsedFilterDate
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT TOP (2)
        TrendName AS trendName,
        COUNT_BIG(1) AS tweetCount
      FROM parsed
      WHERE (@startDate IS NULL OR CAST(parsedFilterDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedFilterDate AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY TrendName
      ORDER BY COUNT_BIG(1) DESC
    `);

    const clusterResult = await pool
      .request()
      .input("startDate", startDateBoundary)
      .input("endDate", endDateBoundary)
      .query<ClusterRow>(`
      WITH parsed AS (
        SELECT
          COALESCE(NULLIF(cluster_name, ''), 'Unlabeled') AS clusterName,
          COALESCE(
            TRY_CONVERT(datetime2, created_date, 126),
            TRY_CONVERT(datetime2, created_date, 120),
            TRY_CONVERT(datetime2, created_date, 103),
            TRY_CONVERT(datetime2, created_date, 105),
            TRY_CAST(created_date AS datetime2)
          ) AS parsedCreatedDate
        FROM dbo.tweet_clustering_results
      )
      SELECT TOP (8)
        clusterName,
        COUNT_BIG(1) AS tweetCount
      FROM parsed
      WHERE (@startDate IS NULL OR CAST(parsedCreatedDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedCreatedDate AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY clusterName
      ORDER BY COUNT_BIG(1) DESC
    `);

    const locationResult = await pool
      .request()
      .input("startDate", startDateBoundary)
      .input("endDate", endDateBoundary)
      .query<LocationRow>(`
      WITH parsed AS (
        SELECT
          LTRIM(RTRIM(UserLocation)) AS location,
          COALESCE(
            TRY_CONVERT(datetime2, CreatedAt, 126),
            TRY_CONVERT(datetime2, CreatedAt, 120),
            TRY_CONVERT(datetime2, CreatedAt, 103),
            TRY_CONVERT(datetime2, CreatedAt, 105),
            TRY_CONVERT(datetime2, CreatedAt, 101),
            TRY_CONVERT(datetime2, CreatedAt, 112),
            TRY_CAST(CreatedAt AS datetime2)
          ) AS parsedCreatedAt
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT TOP (8)
        location,
        COUNT_BIG(1) AS tweetCount
      FROM parsed
      WHERE location IS NOT NULL
        AND location <> ''
        AND (@startDate IS NULL OR CAST(parsedCreatedAt AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedCreatedAt AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY location
      ORDER BY COUNT_BIG(1) DESC
    `);

    const countRow = countResult.recordset[0] ?? {
      totalTweets: 0,
      lastScrape: null,
      minCreated: null,
      maxCreated: null,
    };

    const topTrends: TopTrend[] = trendCountsResult.recordset.map((row) => ({
      name: row.trendName,
      tweets: safeNumber(row.tweetCount),
      level: "verified",
    }));

    const surgingTrends = surgingResult.recordset.map((row) => row.trendName).slice(0, 2);

    while (surgingTrends.length < 2) {
      surgingTrends.push("No trend data");
    }

    const sentimentData: SentimentPoint[] = [
      { name: "Verified", value: 0, color: "#8fce00" },
      { name: "Misinformation", value: 0, color: "#f59e0b" },
      { name: "Neutral", value: 0, color: "#2f7f76" },
    ];

    const ratioData: RatioPoint[] = [];

    const clusterData: ClusterPoint[] = clusterResult.recordset.map((row, index) => {
      const angle = (index / Math.max(1, clusterResult.recordset.length)) * Math.PI * 2;
      return {
        name: row.clusterName,
        z: safeNumber(row.tweetCount),
        x: Math.round(50 + Math.cos(angle) * 28),
        y: Math.round(50 + Math.sin(angle) * 28),
      };
    });

    const maxLocationCount = Math.max(
      0,
      ...locationResult.recordset.map((row) => safeNumber(row.tweetCount)),
    );

    const heatMapData: HeatMapPoint[] = locationResult.recordset.map((row) => {
      const tweets = safeNumber(row.tweetCount);
      return {
        location: row.location,
        tweets,
        level: toHeatLevel(tweets, maxLocationCount),
      };
    });

    return {
      totalTweets: safeNumber(countRow.totalTweets),
      totalTweetsLabel: formatCompact(safeNumber(countRow.totalTweets)),
      dateRangeLabel: `${formatDate(countRow.minCreated)} - ${formatDate(countRow.maxCreated)}`,
      lastScrapeLabel: formatDateTime(countRow.lastScrape),
      surgingTrends,
      sentimentData,
      ratioData,
      clusterData,
      heatMapData,
      topTrends,
      accuracyScore: 0,
      dataWarning: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown SQL dashboard error";
    return fallbackOverviewData(`Dashboard data fallback enabled: ${message}`);
  }
}
