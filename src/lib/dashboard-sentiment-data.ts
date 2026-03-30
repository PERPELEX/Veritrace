import { getSqlPool } from "@/lib/db";
import { getOrSetServerCache, makeServerCacheKey } from "@/lib/server-cache";

type SentimentCountRow = {
  sentiment: string | null;
  tweetCount: number | string | bigint;
};

type DailySentimentRow = {
  dayLabel: string;
  positiveCount: number | string | bigint;
  negativeCount: number | string | bigint;
  neutralCount: number | string | bigint;
  totalCount: number | string | bigint;
};

type ClusterSentimentRow = {
  clusterName: string;
  positiveCount: number | string | bigint;
  negativeCount: number | string | bigint;
  neutralCount: number | string | bigint;
  totalCount: number | string | bigint;
};

type AvailableTrendRow = {
  trendName: string;
};

type TweetIdColumnMapRow = {
  sentimentTweetIdColumn: string | null;
  trendTweetIdColumn: string | null;
  clusterTweetIdColumn: string | null;
};

type SentimentFilterOptions = {
  startDate?: string;
  endDate?: string;
  trendName?: string;
};

export type SentimentDistributionPoint = {
  sentiment: "Positive" | "Negative" | "Neutral";
  count: number;
  color: string;
};

export type DailySentimentPoint = {
  dayLabel: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
};

export type ClusterSentimentPoint = {
  clusterName: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
};

export type TrendPulsePoint = {
  dayLabel: string;
  positive: number;
  negative: number;
  neutral: number;
  total: number;
  pulse: number;
};

export type SentimentPageData = {
  selectedStartDate: string;
  selectedEndDate: string;
  selectedTrendName: string;
  availableTrends: string[];
  totalAnalyzed: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  distribution: SentimentDistributionPoint[];
  dailyTrend: DailySentimentPoint[];
  trendPulse: TrendPulsePoint[];
  clusterMatrix: ClusterSentimentPoint[];
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

function normalizeSentiment(value: string | null) {
  if (!value) {
    return "neutral";
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "positive" || normalized === "verified") {
    return "positive";
  }

  if (normalized === "negative" || normalized === "misinformation" || normalized === "misinfo") {
    return "negative";
  }

  if (normalized === "neutral") {
    return "neutral";
  }

  return "neutral";
}

function toTweetIdExpr(columnName: string | null) {
  if (!columnName) {
    return "CAST(NULL AS nvarchar(100))";
  }

  return `CAST(${columnName} AS nvarchar(100))`;
}

function fallbackSentimentData(message: string): SentimentPageData {
  return {
    selectedStartDate: "",
    selectedEndDate: "",
    selectedTrendName: "",
    availableTrends: [],
    totalAnalyzed: 0,
    positiveCount: 0,
    negativeCount: 0,
    neutralCount: 0,
    distribution: [
      { sentiment: "Positive", count: 0, color: "#8fce00" },
      { sentiment: "Negative", count: 0, color: "#f59e0b" },
      { sentiment: "Neutral", count: 0, color: "#2f7f76" },
    ],
    dailyTrend: [],
    trendPulse: [],
    clusterMatrix: [],
    warning: message,
  };
}

export async function getSentimentPageData(filters?: SentimentFilterOptions): Promise<SentimentPageData> {
  const cacheKey = makeServerCacheKey("dashboard-sentiment", {
    startDate: filters?.startDate ?? "",
    endDate: filters?.endDate ?? "",
    trendName: filters?.trendName ?? "",
  });

  return getOrSetServerCache(cacheKey, 30_000, async () => {
    try {
      const pool = await getSqlPool();
      const startDate = normalizeDateInput(filters?.startDate);
      const endDate = normalizeDateInput(filters?.endDate);
      const trendName = normalizeTrendInput(filters?.trendName);

      const columnMapResult = await getOrSetServerCache(
        makeServerCacheKey("dashboard-sentiment-column-map", "v1"),
        300_000,
        async () => pool.request().query<TweetIdColumnMapRow>(`
      SELECT
        CASE
          WHEN COL_LENGTH('dbo.sentiment_analysis_results', 'tweet_id') IS NOT NULL THEN 'tweet_id'
          WHEN COL_LENGTH('dbo.sentiment_analysis_results', 'TweetID') IS NOT NULL THEN 'TweetID'
          WHEN COL_LENGTH('dbo.sentiment_analysis_results', 'TweetId') IS NOT NULL THEN 'TweetId'
          WHEN COL_LENGTH('dbo.sentiment_analysis_results', 'tweetid') IS NOT NULL THEN 'tweetid'
          ELSE NULL
        END AS sentimentTweetIdColumn,
        CASE
          WHEN COL_LENGTH('dbo.TwitterTrendTweets_All', 'TweetID') IS NOT NULL THEN 'TweetID'
          WHEN COL_LENGTH('dbo.TwitterTrendTweets_All', 'tweet_id') IS NOT NULL THEN 'tweet_id'
          WHEN COL_LENGTH('dbo.TwitterTrendTweets_All', 'TweetId') IS NOT NULL THEN 'TweetId'
          WHEN COL_LENGTH('dbo.TwitterTrendTweets_All', 'tweetid') IS NOT NULL THEN 'tweetid'
          ELSE NULL
        END AS trendTweetIdColumn,
        CASE
          WHEN COL_LENGTH('dbo.tweet_clustering_results', 'tweet_id') IS NOT NULL THEN 'tweet_id'
          WHEN COL_LENGTH('dbo.tweet_clustering_results', 'TweetID') IS NOT NULL THEN 'TweetID'
          WHEN COL_LENGTH('dbo.tweet_clustering_results', 'TweetId') IS NOT NULL THEN 'TweetId'
          WHEN COL_LENGTH('dbo.tweet_clustering_results', 'tweetid') IS NOT NULL THEN 'tweetid'
          ELSE NULL
        END AS clusterTweetIdColumn;
    `),
      );

    const columnMap = columnMapResult.recordset[0] ?? {
      sentimentTweetIdColumn: null,
      trendTweetIdColumn: null,
      clusterTweetIdColumn: null,
    };

    const sentimentTweetIdExpr = toTweetIdExpr(columnMap.sentimentTweetIdColumn);
    const trendTweetIdExpr = toTweetIdExpr(columnMap.trendTweetIdColumn);
    const clusterTweetIdExpr = toTweetIdExpr(columnMap.clusterTweetIdColumn);
    const canTrendJoin = Boolean(columnMap.sentimentTweetIdColumn && columnMap.trendTweetIdColumn);
    const canClusterJoin = Boolean(columnMap.sentimentTweetIdColumn && columnMap.clusterTweetIdColumn);
    const trendFilterInput = canTrendJoin ? trendName : null;
    const joinWarning = trendName && !canTrendJoin
      ? "Trend filter is temporarily unavailable because tweet-id column mapping differs across source tables."
      : null;

    const availableTrendsResult = canTrendJoin
      ? await pool
          .request()
          .input("startDate", startDate)
          .input("endDate", endDate)
          .query<AvailableTrendRow>(`
      WITH sentiment_parsed AS (
        SELECT
          ${sentimentTweetIdExpr} AS tweetId,
          COALESCE(
            TRY_CONVERT(datetime2, created_date, 126),
            TRY_CONVERT(datetime2, created_date, 120),
            TRY_CONVERT(datetime2, created_date, 103),
            TRY_CONVERT(datetime2, created_date, 105),
            TRY_CONVERT(datetime2, created_date, 101),
            TRY_CONVERT(datetime2, created_date, 112),
            TRY_CAST(created_date AS datetime2)
          ) AS parsedCreatedDate
        FROM dbo.sentiment_analysis_results
      ),
      trend_parsed AS (
        SELECT
          ${trendTweetIdExpr} AS tweetId,
          LTRIM(RTRIM(COALESCE(TrendName, ''))) AS trendName
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT TOP (200)
        t.trendName
      FROM sentiment_parsed s
      INNER JOIN trend_parsed t ON t.tweetId = s.tweetId
      WHERE t.trendName <> ''
        AND (@startDate IS NULL OR CAST(s.parsedCreatedDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(s.parsedCreatedDate AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY t.trendName
      ORDER BY t.trendName ASC
    `)
      : { recordset: [] as AvailableTrendRow[] };

      const sentimentRequest = pool
        .request()
        .input("startDate", startDate)
        .input("endDate", endDate)
        .input("trendName", trendFilterInput)
        .query<SentimentCountRow>(`
      WITH sentiment_parsed AS (
        SELECT
          ${sentimentTweetIdExpr} AS tweetId,
          sentiment,
          COALESCE(
            TRY_CONVERT(datetime2, created_date, 126),
            TRY_CONVERT(datetime2, created_date, 120),
            TRY_CONVERT(datetime2, created_date, 103),
            TRY_CONVERT(datetime2, created_date, 105),
            TRY_CONVERT(datetime2, created_date, 101),
            TRY_CONVERT(datetime2, created_date, 112),
            TRY_CAST(created_date AS datetime2)
          ) AS parsedCreatedDate
        FROM dbo.sentiment_analysis_results
      ),
      trend_parsed AS (
        SELECT
          ${trendTweetIdExpr} AS tweetId,
          LTRIM(RTRIM(COALESCE(TrendName, ''))) AS trendName
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT
        s.sentiment,
        COUNT_BIG(1) AS tweetCount
      FROM sentiment_parsed s
      LEFT JOIN trend_parsed t ON t.tweetId = s.tweetId
      WHERE (@startDate IS NULL OR CAST(s.parsedCreatedDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(s.parsedCreatedDate AS date) <= TRY_CAST(@endDate AS date))
        AND (
          @trendName IS NULL
          OR LOWER(LTRIM(RTRIM(COALESCE(t.trendName, '')))) = LOWER(LTRIM(RTRIM(@trendName)))
        )
      GROUP BY s.sentiment
    `);

      const dailyRequest = pool
        .request()
        .input("startDate", startDate)
        .input("endDate", endDate)
        .input("trendName", trendFilterInput)
        .query<DailySentimentRow>(`
      WITH sentiment_parsed AS (
        SELECT
          ${sentimentTweetIdExpr} AS tweetId,
          LOWER(LTRIM(RTRIM(COALESCE(sentiment, 'neutral')))) AS normalizedSentiment
        FROM dbo.sentiment_analysis_results
      ),
      trend_parsed AS (
        SELECT
          ${trendTweetIdExpr} AS tweetId,
          LTRIM(RTRIM(COALESCE(TrendName, ''))) AS trendName,
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
          ) AS parsedCreatedDate
        FROM dbo.TwitterTrendTweets_All
      )
      SELECT
        CONVERT(varchar(10), CAST(t.parsedCreatedDate AS date), 120) AS dayLabel,
        SUM(CASE WHEN COALESCE(s.normalizedSentiment, 'neutral') IN ('positive', 'verified') THEN 1 ELSE 0 END) AS positiveCount,
        SUM(CASE WHEN COALESCE(s.normalizedSentiment, 'neutral') IN ('negative', 'misinformation', 'misinfo') THEN 1 ELSE 0 END) AS negativeCount,
        SUM(CASE WHEN COALESCE(s.normalizedSentiment, 'neutral') NOT IN ('positive', 'verified', 'negative', 'misinformation', 'misinfo') THEN 1 ELSE 0 END) AS neutralCount,
        COUNT_BIG(1) AS totalCount
      FROM trend_parsed t
      LEFT JOIN sentiment_parsed s ON s.tweetId = t.tweetId
      WHERE t.parsedCreatedDate IS NOT NULL
        AND (@startDate IS NULL OR CAST(t.parsedCreatedDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(t.parsedCreatedDate AS date) <= TRY_CAST(@endDate AS date))
        AND (
          @trendName IS NULL
          OR LOWER(LTRIM(RTRIM(COALESCE(t.trendName, '')))) = LOWER(LTRIM(RTRIM(@trendName)))
        )
        AND ((@startDate IS NOT NULL OR @endDate IS NOT NULL) OR t.parsedCreatedDate >= DATEADD(DAY, -6, SYSUTCDATETIME()))
      GROUP BY CAST(t.parsedCreatedDate AS date)
      ORDER BY CAST(t.parsedCreatedDate AS date) ASC
    `);

      const clusterRequest = canClusterJoin
        ? pool
            .request()
            .input("startDate", startDate)
            .input("endDate", endDate)
            .input("trendName", trendFilterInput)
            .query<ClusterSentimentRow>(`
      WITH sentiment_parsed AS (
        SELECT
          ${sentimentTweetIdExpr} AS tweetId,
          LOWER(LTRIM(RTRIM(COALESCE(sentiment, 'neutral')))) AS normalizedSentiment,
          COALESCE(
            TRY_CONVERT(datetime2, created_date, 126),
            TRY_CONVERT(datetime2, created_date, 120),
            TRY_CONVERT(datetime2, created_date, 103),
            TRY_CONVERT(datetime2, created_date, 105),
            TRY_CONVERT(datetime2, created_date, 101),
            TRY_CONVERT(datetime2, created_date, 112),
            TRY_CAST(created_date AS datetime2)
          ) AS parsedCreatedDate
        FROM dbo.sentiment_analysis_results
      ),
      cluster_parsed AS (
        SELECT
          ${clusterTweetIdExpr} AS tweetId,
          COALESCE(NULLIF(cluster_name, ''), 'Unlabeled') AS clusterName
        FROM dbo.tweet_clustering_results
      )
      SELECT TOP (12)
        c.clusterName,
        SUM(CASE WHEN s.normalizedSentiment IN ('positive', 'verified') THEN 1 ELSE 0 END) AS positiveCount,
        SUM(CASE WHEN s.normalizedSentiment IN ('negative', 'misinformation', 'misinfo') THEN 1 ELSE 0 END) AS negativeCount,
        SUM(CASE WHEN s.normalizedSentiment NOT IN ('positive', 'verified', 'negative', 'misinformation', 'misinfo') THEN 1 ELSE 0 END) AS neutralCount,
        COUNT_BIG(1) AS totalCount
      FROM sentiment_parsed s
      INNER JOIN cluster_parsed c ON c.tweetId = s.tweetId
      LEFT JOIN (
        SELECT
          ${trendTweetIdExpr} AS tweetId,
          LTRIM(RTRIM(COALESCE(TrendName, ''))) AS trendName
        FROM dbo.TwitterTrendTweets_All
      ) t ON t.tweetId = s.tweetId
      WHERE (@startDate IS NULL OR CAST(s.parsedCreatedDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(s.parsedCreatedDate AS date) <= TRY_CAST(@endDate AS date))
        AND (
          @trendName IS NULL
          OR LOWER(LTRIM(RTRIM(COALESCE(t.trendName, '')))) = LOWER(LTRIM(RTRIM(@trendName)))
        )
      GROUP BY c.clusterName
      ORDER BY COUNT_BIG(1) DESC
      `)
          : Promise.resolve({ recordset: [] as ClusterSentimentRow[] });

        const [sentimentResult, dailyResult, clusterMatrixResult] = await Promise.all([
          sentimentRequest,
          dailyRequest,
          clusterRequest,
        ]);

    const counts = sentimentResult.recordset.reduce(
      (acc, row) => {
        const bucket = normalizeSentiment(row.sentiment);
        acc[bucket] += safeNumber(row.tweetCount);
        return acc;
      },
      { positive: 0, negative: 0, neutral: 0 },
    );

    const distribution: SentimentDistributionPoint[] = [
      { sentiment: "Positive", count: counts.positive, color: "#8fce00" },
      { sentiment: "Negative", count: counts.negative, color: "#f59e0b" },
      { sentiment: "Neutral", count: counts.neutral, color: "#2f7f76" },
    ];

    const dailyTrend: DailySentimentPoint[] = dailyResult.recordset.map((row) => ({
      dayLabel: row.dayLabel,
      positive: safeNumber(row.positiveCount),
      negative: safeNumber(row.negativeCount),
      neutral: safeNumber(row.neutralCount),
      total: safeNumber(row.totalCount),
    }));

    const trendPulse: TrendPulsePoint[] = dailyTrend.map((row) => ({
      ...row,
      pulse: row.total > 0 ? Math.round(((row.positive - row.negative) / row.total) * 100) : 0,
    }));

    const clusterMatrix: ClusterSentimentPoint[] = clusterMatrixResult.recordset.map((row) => ({
      clusterName: row.clusterName,
      positive: safeNumber(row.positiveCount),
      negative: safeNumber(row.negativeCount),
      neutral: safeNumber(row.neutralCount),
      total: safeNumber(row.totalCount),
    }));

      return {
        selectedStartDate: startDate ?? "",
        selectedEndDate: endDate ?? "",
        selectedTrendName: trendName ?? "",
        availableTrends: availableTrendsResult.recordset
          .map((row) => row.trendName)
          .filter((name): name is string => Boolean(name)),
        totalAnalyzed: counts.positive + counts.negative + counts.neutral,
        positiveCount: counts.positive,
        negativeCount: counts.negative,
        neutralCount: counts.neutral,
        distribution,
        dailyTrend,
        trendPulse,
        clusterMatrix,
        warning: joinWarning,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown sentiment data error";
      return fallbackSentimentData(`Sentiment data fallback enabled: ${message}`);
    }
  });
}
