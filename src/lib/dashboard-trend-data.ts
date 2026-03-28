import { getSqlPool } from "@/lib/db";

type TrendSummaryRow = {
  trendName: string;
  tweetCount: number | string | bigint;
  latestSeen: Date | string | null;
};

type AvailableTrendRow = {
  trendName: string;
};

type DailyVolumeRow = {
  dayLabel: string;
  tweetCount: number | string | bigint;
};

type LocationRow = {
  location: string;
  tweetCount: number | string | bigint;
};

type PosterOrderRow = {
  tweetId: string | number | bigint;
  screenName: string | null;
  userName: string | null;
  userLocation: string | null;
  postedAt: Date | string | null;
};

export type TrendSummary = {
  trendName: string;
  tweetCount: number;
  latestSeen: string;
};

export type DailyVolumePoint = {
  dayLabel: string;
  tweetCount: number;
};

export type PosterTreeNode = {
  id: string;
  parentId: string | null;
  label: string;
  location: string;
  postedAt: string;
  ordinal: number;
};

export type PosterTimelinePoint = {
  sequence: number;
  postedAtLabel: string;
  epochMs: number;
};

export type TrendHeatMapPoint = {
  location: string;
  tweets: number;
  level: "low" | "medium" | "high";
};

type TrendFilterOptions = {
  startDate?: string;
  endDate?: string;
  trendName?: string;
};

export type TrendPageData = {
  totalTweets: number;
  trendCount: number;
  topTrends: TrendSummary[];
  availableTrends: string[];
  selectedTrendName: string;
  selectedStartDate: string;
  selectedEndDate: string;
  dailyVolume: DailyVolumePoint[];
  posterTree: PosterTreeNode[];
  posterTimeline: PosterTimelinePoint[];
  trendHeatMap: TrendHeatMapPoint[];
  firstPoster: string;
  secondPoster: string;
  warning: string | null;
};

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

function formatDate(value: Date | string | null) {
  if (!value) {
    return "N/A";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

function parseDateTime(value: Date | string | null) {
  if (!value) {
    return null;
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return parsed;
}

function formatDateTime(value: Date | string | null) {
  const parsed = parseDateTime(value);

  if (!parsed) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function formatTimeOnly(value: Date | string | null) {
  const parsed = parseDateTime(value);

  if (!parsed) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(parsed);
}

function fallbackTrendData(message: string): TrendPageData {
  return {
    totalTweets: 0,
    trendCount: 0,
    topTrends: [],
    availableTrends: [],
    selectedTrendName: "",
    selectedStartDate: "",
    selectedEndDate: "",
    dailyVolume: [],
    posterTree: [],
    posterTimeline: [],
    trendHeatMap: [],
    firstPoster: "N/A",
    secondPoster: "N/A",
    warning: message,
  };
}

export async function getTrendPageData(filters?: TrendFilterOptions): Promise<TrendPageData> {
  try {
    const pool = await getSqlPool();
    const startDate = normalizeDateInput(filters?.startDate);
    const endDate = normalizeDateInput(filters?.endDate);
    const trendName = normalizeTrendInput(filters?.trendName);

    const topTrendsResult = await pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .input("trendName", trendName)
      .query<TrendSummaryRow>(`
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
      SELECT TOP (20)
        TrendName AS trendName,
        COUNT_BIG(1) AS tweetCount,
        MAX(parsedFilterDate) AS latestSeen
      FROM parsed
      WHERE (
        @trendName IS NULL
        OR LOWER(LTRIM(RTRIM(TrendName))) = LOWER(LTRIM(RTRIM(@trendName)))
      )
        AND (@startDate IS NULL OR CAST(parsedFilterDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedFilterDate AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY TrendName
      ORDER BY COUNT_BIG(1) DESC
    `);

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

    const dailyVolumeResult = await pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .input("trendName", trendName)
      .query<DailyVolumeRow>(`
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
        CONVERT(varchar(10), CAST(parsedFilterDate AS date), 120) AS dayLabel,
        COUNT_BIG(1) AS tweetCount
      FROM parsed
      WHERE parsedFilterDate IS NOT NULL
        AND (
          @trendName IS NULL
          OR LOWER(LTRIM(RTRIM(TrendName))) = LOWER(LTRIM(RTRIM(@trendName)))
        )
        AND (@startDate IS NULL OR CAST(parsedFilterDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedFilterDate AS date) <= TRY_CAST(@endDate AS date))
        AND ((@startDate IS NOT NULL OR @endDate IS NOT NULL) OR parsedFilterDate >= DATEADD(DAY, -6, SYSUTCDATETIME()))
      GROUP BY CAST(parsedFilterDate AS date)
      ORDER BY CAST(parsedFilterDate AS date) ASC
    `);

    const trendHeatMapResult = await pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .input("trendName", trendName)
      .query<LocationRow>(`
      WITH parsed AS (
        SELECT
          t.TrendName,
          LTRIM(RTRIM(u.UserLocation)) AS location,
          COALESCE(
            TRY_CONVERT(datetime2, t.CreatedAt, 126),
            TRY_CONVERT(datetime2, t.CreatedAt, 120),
            TRY_CONVERT(datetime2, t.CreatedAt, 103),
            TRY_CONVERT(datetime2, t.CreatedAt, 105),
            TRY_CONVERT(datetime2, t.CreatedAt, 101),
            TRY_CONVERT(datetime2, t.CreatedAt, 112),
            CAST(TRY_PARSE(CONVERT(nvarchar(100), t.CreatedAt) AS datetimeoffset USING 'en-US') AS datetime2),
            CAST(TRY_PARSE(REPLACE(CONVERT(nvarchar(100), t.CreatedAt), ' +0000', '') AS datetime2 USING 'en-US') AS datetime2),
            CAST(
              TRY_PARSE(
                CONCAT(
                  SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 5, 6),
                  ' ',
                  RIGHT(CONVERT(nvarchar(100), t.CreatedAt), 4),
                  ' ',
                  SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 12, 8),
                  ' ',
                  LEFT(SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 21, 5), 3),
                  ':',
                  RIGHT(SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 21, 5), 2)
                ) AS datetimeoffset USING 'en-US'
              ) AS datetime2
            ),
            TRY_CAST(t.CreatedAt AS datetime2),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 126),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 120),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 103),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 105),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 101),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 112),
            CAST(TRY_PARSE(CONVERT(nvarchar(100), t.TweetCollectedAt) AS datetimeoffset USING 'en-US') AS datetime2),
            TRY_CAST(t.TweetCollectedAt AS datetime2)
          ) AS parsedFilterDate
        FROM dbo.TwitterTrendTweets_All t
        LEFT JOIN dbo.TwitterUsers u
          ON LOWER(REPLACE(LTRIM(RTRIM(u.ScreenName)), '@', '')) = LOWER(REPLACE(LTRIM(RTRIM(t.ScreenName)), '@', ''))
      )
      SELECT TOP (8)
        location,
        COUNT_BIG(1) AS tweetCount
      FROM parsed
      WHERE location IS NOT NULL
        AND location <> ''
        AND (
          @trendName IS NULL
          OR LOWER(LTRIM(RTRIM(TrendName))) = LOWER(LTRIM(RTRIM(@trendName)))
        )
        AND (@startDate IS NULL OR CAST(parsedFilterDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedFilterDate AS date) <= TRY_CAST(@endDate AS date))
      GROUP BY location
      ORDER BY COUNT_BIG(1) DESC
    `);

    const posterResult = await pool
      .request()
      .input("startDate", startDate)
      .input("endDate", endDate)
      .input("trendName", trendName)
      .query<PosterOrderRow>(`
      WITH parsed AS (
        SELECT
          t.TweetID,
          t.ScreenName,
          t.Username,
          u.UserLocation,
          t.TrendName,
          COALESCE(
            TRY_CONVERT(datetime2, t.CreatedAt, 126),
            TRY_CONVERT(datetime2, t.CreatedAt, 120),
            TRY_CONVERT(datetime2, t.CreatedAt, 103),
            TRY_CONVERT(datetime2, t.CreatedAt, 105),
            TRY_CONVERT(datetime2, t.CreatedAt, 101),
            TRY_CONVERT(datetime2, t.CreatedAt, 112),
            CAST(TRY_PARSE(CONVERT(nvarchar(100), t.CreatedAt) AS datetimeoffset USING 'en-US') AS datetime2),
            CAST(TRY_PARSE(REPLACE(CONVERT(nvarchar(100), t.CreatedAt), ' +0000', '') AS datetime2 USING 'en-US') AS datetime2),
            CAST(
              TRY_PARSE(
                CONCAT(
                  SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 5, 6),
                  ' ',
                  RIGHT(CONVERT(nvarchar(100), t.CreatedAt), 4),
                  ' ',
                  SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 12, 8),
                  ' ',
                  LEFT(SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 21, 5), 3),
                  ':',
                  RIGHT(SUBSTRING(CONVERT(nvarchar(100), t.CreatedAt), 21, 5), 2)
                ) AS datetimeoffset USING 'en-US'
              ) AS datetime2
            ),
            TRY_CAST(t.CreatedAt AS datetime2)
          ) AS postedAt
        FROM dbo.TwitterTrendTweets_All t
        LEFT JOIN dbo.TwitterUsers u
          ON LOWER(REPLACE(LTRIM(RTRIM(u.ScreenName)), '@', '')) = LOWER(REPLACE(LTRIM(RTRIM(t.ScreenName)), '@', ''))
      )
      SELECT TOP (4)
        TweetID AS tweetId,
        ScreenName AS screenName,
        Username AS userName,
        UserLocation AS userLocation,
        postedAt
      FROM parsed
      WHERE postedAt IS NOT NULL
        AND (
          @trendName IS NULL
          OR LOWER(LTRIM(RTRIM(TrendName))) = LOWER(LTRIM(RTRIM(@trendName)))
        )
        AND (@startDate IS NULL OR CAST(postedAt AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(postedAt AS date) <= TRY_CAST(@endDate AS date))
      ORDER BY postedAt ASC
    `);

    const topTrends = topTrendsResult.recordset.map((row) => ({
      trendName: row.trendName,
      tweetCount: safeNumber(row.tweetCount),
      latestSeen: formatDate(row.latestSeen),
    }));

    const availableTrends = availableTrendsResult.recordset
      .map((row) => row.trendName)
      .filter((name): name is string => Boolean(name));

    const dailyVolume = dailyVolumeResult.recordset.map((row) => ({
      dayLabel: row.dayLabel,
      tweetCount: safeNumber(row.tweetCount),
    }));

    const posterTree: PosterTreeNode[] = posterResult.recordset.map((row, index) => {
      const id = String(index + 1);
      const parentId = index === 0 ? null : String(Math.floor((index - 1) / 2) + 1);
      const label = row.screenName || row.userName || "Unknown User";
      const location = row.userLocation?.trim() ? row.userLocation.trim() : "Unknown location";

      return {
        id,
        parentId,
        label,
        location,
        postedAt: formatDateTime(row.postedAt),
        ordinal: index + 1,
      };
    });

    const posterTimeline: PosterTimelinePoint[] = posterResult.recordset
      .map((row, index) => {
        const parsed = parseDateTime(row.postedAt);
        return {
          sequence: index + 1,
          postedAtLabel: formatTimeOnly(row.postedAt),
          epochMs: parsed?.getTime() ?? 0,
        };
      })
      .filter((point) => point.epochMs > 0);

    const maxLocationCount = Math.max(
      0,
      ...trendHeatMapResult.recordset.map((row) => safeNumber(row.tweetCount)),
    );

    const trendHeatMap: TrendHeatMapPoint[] = trendHeatMapResult.recordset.map((row) => {
      const tweets = safeNumber(row.tweetCount);
      return {
        location: row.location,
        tweets,
        level: toHeatLevel(tweets, maxLocationCount),
      };
    });

    const firstPoster = posterTree[0]?.label ?? "N/A";
    const secondPoster = posterTree[1]?.label ?? "N/A";

    const totalTweets = topTrends.reduce((sum, trend) => sum + trend.tweetCount, 0);

    return {
      totalTweets,
      trendCount: topTrends.length,
      topTrends,
      availableTrends,
      selectedTrendName: trendName ?? "",
      selectedStartDate: startDate ?? "",
      selectedEndDate: endDate ?? "",
      dailyVolume,
      posterTree,
      posterTimeline,
      trendHeatMap,
      firstPoster,
      secondPoster,
      warning: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown trend data error";
    return fallbackTrendData(`Trend data fallback enabled: ${message}`);
  }
}
