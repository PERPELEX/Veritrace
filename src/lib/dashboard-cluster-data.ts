import { getSqlPool } from "@/lib/db";

type ClusterRow = {
  clusterName: string;
  tweetCount: number | string | bigint;
};

type AvailableTrendRow = {
  trendName: string;
};

type ClusterFilterOptions = {
  startDate?: string;
  endDate?: string;
  trendName?: string;
};

export type ClusterPoint = {
  name: string;
  tweets: number;
};

export type ClusterPageData = {
  selectedStartDate: string;
  selectedEndDate: string;
  selectedTrendName: string;
  availableTrends: string[];
  totalClusterTweets: number;
  uniqueClusters: number;
  topClusterName: string;
  clusters: ClusterPoint[];
  warning: string | null;
};

function safeNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "bigint") {
    const asNumber = Number(value);
    return Number.isFinite(asNumber) ? asNumber : 0;
  }

  if (typeof value === "string") {
    const asNumber = Number(value.trim());
    return Number.isFinite(asNumber) ? asNumber : 0;
  }

  return 0;
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

function normalizeTrendInput(value?: string) {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

function fallbackClusterData(message: string): ClusterPageData {
  return {
    selectedStartDate: "",
    selectedEndDate: "",
    selectedTrendName: "",
    availableTrends: [],
    totalClusterTweets: 0,
    uniqueClusters: 0,
    topClusterName: "N/A",
    clusters: [],
    warning: message,
  };
}

export async function getClusterPageData(filters?: ClusterFilterOptions): Promise<ClusterPageData> {
  try {
    const pool = await getSqlPool();
    const startDate = normalizeDateInput(filters?.startDate);
    const endDate = normalizeDateInput(filters?.endDate);
    const trendName = normalizeTrendInput(filters?.trendName);

    const clusterSql = `
      DECLARE @hasTrendNameColumn bit = CASE WHEN COL_LENGTH('dbo.tweet_clustering_results', 'trend_name') IS NULL THEN 0 ELSE 1 END;

      DECLARE @sql nvarchar(max) = N'
      WITH parsed AS (
        SELECT
          COALESCE(NULLIF(cluster_name, ''''), ''Unlabeled'') AS clusterName,
          COALESCE(
            TRY_CONVERT(datetime2, created_date, 126),
            TRY_CONVERT(datetime2, created_date, 120),
            TRY_CONVERT(datetime2, created_date, 103),
            TRY_CONVERT(datetime2, created_date, 105),
            TRY_CAST(created_date AS datetime2)
          ) AS parsedCreatedDate,
          ' + CASE WHEN @hasTrendNameColumn = 1
            THEN N'LTRIM(RTRIM(COALESCE(trend_name, ''''))) AS normalizedTrendName'
            ELSE N'CAST(NULL AS nvarchar(255)) AS normalizedTrendName'
          END + N'
        FROM dbo.tweet_clustering_results
      )
      SELECT TOP (20)
        clusterName,
        COUNT_BIG(1) AS tweetCount
      FROM parsed
      WHERE (@startDate IS NULL OR CAST(parsedCreatedDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedCreatedDate AS date) <= TRY_CAST(@endDate AS date))
        AND (
          @trendName IS NULL
          OR normalizedTrendName IS NULL
          OR LOWER(normalizedTrendName) = LOWER(LTRIM(RTRIM(@trendName)))
        )
      GROUP BY clusterName
      ORDER BY COUNT_BIG(1) DESC';

      EXEC sp_executesql
        @sql,
        N'@startDate nvarchar(10), @endDate nvarchar(10), @trendName nvarchar(255)',
        @startDate, @endDate, @trendName;
    `;

    const clustersResult = await pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .input("trendName", trendName)
      .query<ClusterRow>(clusterSql);

    const availableTrendsResult = await pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .query<AvailableTrendRow>(`
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
            CAST(TRY_PARSE(CONVERT(nvarchar(100), CreatedAt) AS datetimeoffset USING 'en-US') AS datetime2),
            CAST(TRY_PARSE(REPLACE(CONVERT(nvarchar(100), CreatedAt), ' +0000', '') AS datetime2 USING 'en-US') AS datetime2),
            TRY_CAST(CreatedAt AS datetime2),
            TRY_CONVERT(datetime2, TweetCollectedAt, 126),
            TRY_CONVERT(datetime2, TweetCollectedAt, 120),
            TRY_CONVERT(datetime2, TweetCollectedAt, 103),
            TRY_CONVERT(datetime2, TweetCollectedAt, 105),
            TRY_CONVERT(datetime2, TweetCollectedAt, 101),
            TRY_CONVERT(datetime2, TweetCollectedAt, 112),
            CAST(TRY_PARSE(CONVERT(nvarchar(100), TweetCollectedAt) AS datetimeoffset USING 'en-US') AS datetime2),
            CAST(TRY_PARSE(REPLACE(CONVERT(nvarchar(100), TweetCollectedAt), ' +0000', '') AS datetime2 USING 'en-US') AS datetime2),
            TRY_CAST(TweetCollectedAt AS datetime2)
          ) AS parsedFilterDate
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT TOP (200)
        TrendName AS trendName
      FROM parsed
      WHERE TrendName IS NOT NULL
        AND LTRIM(RTRIM(TrendName)) <> ''
        AND (@startDate IS NULL OR CAST(parsedFilterDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedFilterDate AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY TrendName
      ORDER BY TrendName ASC
    `);

    const clusters: ClusterPoint[] = clustersResult.recordset.map((row) => ({
      name: row.clusterName,
      tweets: safeNumber(row.tweetCount),
    }));

    const totalClusterTweets = clusters.reduce((sum, item) => sum + item.tweets, 0);

    return {
      selectedStartDate: startDate ?? "",
      selectedEndDate: endDate ?? "",
      selectedTrendName: trendName ?? "",
      availableTrends: availableTrendsResult.recordset
        .map((row) => row.trendName)
        .filter((name): name is string => Boolean(name)),
      totalClusterTweets,
      uniqueClusters: clusters.length,
      topClusterName: clusters[0]?.name ?? "N/A",
      clusters,
      warning: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown cluster data error";
    return fallbackClusterData(`Cluster data fallback enabled: ${message}`);
  }
}
