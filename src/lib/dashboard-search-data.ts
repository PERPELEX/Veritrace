import { getSqlPool } from "@/lib/db";

type UserProfileRow = {
  screenName: string | null;
  userLocation: string | null;
  lastUpdated: Date | string | null;
};

type SummaryRow = {
  totalTweets: number | string | bigint;
  firstTweetAt: Date | string | null;
  latestTweetAt: Date | string | null;
  activeDays: number | string | bigint;
  uniqueTrends: number | string | bigint;
};

type DailyRow = {
  dayLabel: string;
  tweetCount: number | string | bigint;
};

type HourlyRow = {
  hourOfDay: number | string | bigint;
  tweetCount: number | string | bigint;
};

type TrendRow = {
  trendName: string;
  tweetCount: number | string | bigint;
};

type TweetRow = {
  tweetId: string | number | bigint | null;
  screenName: string | null;
  userName: string | null;
  trendName: string | null;
  tweetText: string | null;
  source: string | null;
  retweetCount: number | string | bigint | null;
  favoriteCount: number | string | bigint | null;
  createdAt: Date | string | null;
};

type RankingRow = {
  screenName: string | null;
  userName: string | null;
  tweetCount: number | string | bigint;
};

export type UserProfile = {
  screenName: string;
  userLocation: string;
  lastUpdated: string;
  totalTweets: number;
  firstTweetAt: string;
  latestTweetAt: string;
  activeDays: number;
  uniqueTrends: number;
};

export type DailyTweetPoint = {
  dayLabel: string;
  tweetCount: number;
};

export type HourlyTweetPoint = {
  hourLabel: string;
  tweetCount: number;
};

export type TrendDistributionPoint = {
  trendName: string;
  tweetCount: number;
};

export type UserTweetResult = {
  tweetId: string;
  screenName: string;
  userName: string;
  trendName: string;
  tweetText: string;
  source: string;
  retweetCount: number;
  favoriteCount: number;
  createdAt: string;
};

export type UserActivityRank = {
  screenName: string;
  userName: string;
  tweetCount: number;
};

export type SearchPageData = {
  query: string;
  selectedStartDate: string;
  selectedEndDate: string;
  selectedTrendName: string;
  selectedKeyword: string;
  profile: UserProfile | null;
  availableTrends: string[];
  dailyVolume: DailyTweetPoint[];
  hourlyVolume: HourlyTweetPoint[];
  trendDistribution: TrendDistributionPoint[];
  tweets: UserTweetResult[];
  userRanking: UserActivityRank[];
  warning: string | null;
};

type SearchFilterOptions = {
  query?: string;
  startDate?: string;
  endDate?: string;
  trendName?: string;
  keyword?: string;
};

function normalizeInput(value?: string) {
  if (!value) {
    return "";
  }
  return value.trim();
}

function normalizeDateInput(value?: string) {
  const normalized = normalizeInput(value);
  if (!normalized) {
    return "";
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return "";
  }
  return normalized;
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

function formatDateTime(value: Date | string | null) {
  if (!value) {
    return "N/A";
  }

  const parsed = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
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

function emptyResult(filters: SearchFilterOptions, warning: string | null = null): SearchPageData {
  return {
    query: normalizeInput(filters.query),
    selectedStartDate: normalizeDateInput(filters.startDate),
    selectedEndDate: normalizeDateInput(filters.endDate),
    selectedTrendName: normalizeInput(filters.trendName),
    selectedKeyword: normalizeInput(filters.keyword),
    profile: null,
    availableTrends: [],
    dailyVolume: [],
    hourlyVolume: [],
    trendDistribution: [],
    tweets: [],
    userRanking: [],
    warning,
  };
}

export async function getSearchPageData(filters?: SearchFilterOptions): Promise<SearchPageData> {
  const safeFilters: SearchFilterOptions = filters ?? {};
  const query = normalizeInput(safeFilters.query);
  const startDate = normalizeDateInput(safeFilters.startDate);
  const endDate = normalizeDateInput(safeFilters.endDate);
  const trendName = normalizeInput(safeFilters.trendName);
  const keyword = normalizeInput(safeFilters.keyword);

  try {
    const pool = await getSqlPool();

    const rankingResult = await pool
      .request()
      .input("startDate", startDate || null)
      .input("endDate", endDate || null)
      .input("trendName", trendName || null)
      .input("keyword", keyword || null)
      .query<RankingRow>(`
        WITH parsed AS (
          SELECT
            t.TrendName,
            t.ScreenName,
            t.Username,
            CONVERT(nvarchar(max), t.TweetText) AS tweetText,
            COALESCE(
              TRY_CONVERT(datetime2, t.CreatedAt, 126),
              TRY_CONVERT(datetime2, t.CreatedAt, 120),
              TRY_CONVERT(datetime2, t.CreatedAt, 103),
              TRY_CONVERT(datetime2, t.CreatedAt, 105),
              TRY_CONVERT(datetime2, t.CreatedAt, 101),
              TRY_CONVERT(datetime2, t.CreatedAt, 112),
              CAST(TRY_PARSE(CONVERT(nvarchar(100), t.CreatedAt) AS datetimeoffset USING 'en-US') AS datetime2),
              CAST(TRY_PARSE(REPLACE(CONVERT(nvarchar(100), t.CreatedAt), ' +0000', '') AS datetime2 USING 'en-US') AS datetime2),
              TRY_CAST(t.CreatedAt AS datetime2),
              TRY_CONVERT(datetime2, t.TweetCollectedAt, 126),
              TRY_CONVERT(datetime2, t.TweetCollectedAt, 120),
              TRY_CONVERT(datetime2, t.TweetCollectedAt, 103),
              TRY_CONVERT(datetime2, t.TweetCollectedAt, 105),
              TRY_CAST(t.TweetCollectedAt AS datetime2)
            ) AS parsedDate
          FROM dbo.TwitterTrendTweets_All t
        )
        SELECT TOP (30)
          ISNULL(NULLIF(LTRIM(RTRIM(ScreenName)), ''), 'Unknown') AS screenName,
          ISNULL(NULLIF(LTRIM(RTRIM(Username)), ''), 'Unknown') AS userName,
          COUNT_BIG(1) AS tweetCount
        FROM parsed
        WHERE parsedDate IS NOT NULL
          AND (@startDate IS NULL OR CAST(parsedDate AS date) >= TRY_CAST(@startDate AS date))
          AND (@endDate IS NULL OR CAST(parsedDate AS date) <= TRY_CAST(@endDate AS date))
          AND (@trendName IS NULL OR LOWER(LTRIM(RTRIM(TrendName))) = LOWER(LTRIM(RTRIM(@trendName))))
          AND (
            @keyword IS NULL
            OR @keyword = ''
            OR LOWER(ISNULL(TrendName, '')) LIKE CONCAT('%', LOWER(@keyword), '%')
            OR LOWER(ISNULL(Username, '')) LIKE CONCAT('%', LOWER(@keyword), '%')
            OR LOWER(ISNULL(tweetText, '')) LIKE CONCAT('%', LOWER(@keyword), '%')
            OR LOWER(ISNULL(ScreenName, '')) LIKE CONCAT('%', LOWER(@keyword), '%')
          )
        GROUP BY
          ISNULL(NULLIF(LTRIM(RTRIM(ScreenName)), ''), 'Unknown'),
          ISNULL(NULLIF(LTRIM(RTRIM(Username)), ''), 'Unknown')
        ORDER BY COUNT_BIG(1) DESC, ISNULL(NULLIF(LTRIM(RTRIM(ScreenName)), ''), 'Unknown') ASC;
      `);

    const userRanking: UserActivityRank[] = rankingResult.recordset.map((row) => ({
      screenName: row.screenName?.trim() || "Unknown",
      userName: row.userName?.trim() || "Unknown",
      tweetCount: safeNumber(row.tweetCount),
    }));

    if (!query) {
      return {
        ...emptyResult(safeFilters),
        userRanking,
      };
    }

    const profileResult = await pool
      .request()
      .input("query", query)
      .query<UserProfileRow>(`
        SELECT TOP (1)
          ScreenName AS screenName,
          UserLocation AS userLocation,
          LastUpdated AS lastUpdated
        FROM dbo.TwitterUsers
        WHERE ScreenName IS NOT NULL
          AND LTRIM(RTRIM(ScreenName)) <> ''
          AND (
            LOWER(LTRIM(RTRIM(ScreenName))) LIKE CONCAT('%', LOWER(LTRIM(RTRIM(@query))), '%')
            OR LOWER(REPLACE(LTRIM(RTRIM(ScreenName)), '@', '')) LIKE CONCAT('%', LOWER(REPLACE(LTRIM(RTRIM(@query)), '@', '')), '%')
          )
        ORDER BY LastUpdated DESC
      `);

    const profileRow = profileResult.recordset[0];
    if (!profileRow?.screenName) {
      return {
        ...emptyResult(safeFilters, "No user account found for the provided screen name."),
        userRanking,
      };
    }

    const normalizedScreenName = profileRow.screenName.trim().replace(/^@/, "").toLowerCase();

    const analyticsResult = await pool
      .request()
      .input("screenNormalized", normalizedScreenName)
      .input("startDate", startDate || null)
      .input("endDate", endDate || null)
      .input("trendName", trendName || null)
      .input("keyword", keyword || null)
      .query(`
      WITH parsed AS (
        SELECT
          t.TrendName,
          t.ScreenName,
          t.Username,
          CONVERT(nvarchar(100), t.TweetID) AS tweetId,
          CONVERT(nvarchar(max), t.TweetText) AS tweetText,
          CONVERT(nvarchar(255), t.TweetLanguage) AS source,
          TRY_CONVERT(bigint, t.Retweets) AS retweetCount,
          TRY_CONVERT(bigint, t.Likes) AS favoriteCount,
          COALESCE(
            TRY_CONVERT(datetime2, t.CreatedAt, 126),
            TRY_CONVERT(datetime2, t.CreatedAt, 120),
            TRY_CONVERT(datetime2, t.CreatedAt, 103),
            TRY_CONVERT(datetime2, t.CreatedAt, 105),
            TRY_CONVERT(datetime2, t.CreatedAt, 101),
            TRY_CONVERT(datetime2, t.CreatedAt, 112),
            CAST(TRY_PARSE(CONVERT(nvarchar(100), t.CreatedAt) AS datetimeoffset USING 'en-US') AS datetime2),
            CAST(TRY_PARSE(REPLACE(CONVERT(nvarchar(100), t.CreatedAt), ' +0000', '') AS datetime2 USING 'en-US') AS datetime2),
            TRY_CAST(t.CreatedAt AS datetime2),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 126),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 120),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 103),
            TRY_CONVERT(datetime2, t.TweetCollectedAt, 105),
            TRY_CAST(t.TweetCollectedAt AS datetime2)
          ) AS parsedDate
        FROM dbo.TwitterTrendTweets_All t
        WHERE LOWER(REPLACE(LTRIM(RTRIM(t.ScreenName)), '@', '')) = @screenNormalized
      )
      SELECT *
      INTO #filtered
      FROM parsed
      WHERE parsedDate IS NOT NULL
        AND (@startDate IS NULL OR CAST(parsedDate AS date) >= TRY_CAST(@startDate AS date))
        AND (@endDate IS NULL OR CAST(parsedDate AS date) <= TRY_CAST(@endDate AS date))
        AND (@trendName IS NULL OR LOWER(LTRIM(RTRIM(TrendName))) = LOWER(LTRIM(RTRIM(@trendName))))
        AND (
          @keyword IS NULL
          OR @keyword = ''
          OR LOWER(ISNULL(TrendName, '')) LIKE CONCAT('%', LOWER(@keyword), '%')
          OR LOWER(ISNULL(Username, '')) LIKE CONCAT('%', LOWER(@keyword), '%')
          OR LOWER(ISNULL(tweetText, '')) LIKE CONCAT('%', LOWER(@keyword), '%')
        );

      SELECT
        COUNT_BIG(1) AS totalTweets,
        MIN(parsedDate) AS firstTweetAt,
        MAX(parsedDate) AS latestTweetAt,
        COUNT(DISTINCT CAST(parsedDate AS date)) AS activeDays,
        COUNT(DISTINCT ISNULL(TrendName, '')) AS uniqueTrends
      FROM #filtered;

      SELECT TOP (90)
        CONVERT(varchar(10), CAST(parsedDate AS date), 120) AS dayLabel,
        COUNT_BIG(1) AS tweetCount
      FROM #filtered
      GROUP BY CAST(parsedDate AS date)
      ORDER BY CAST(parsedDate AS date) ASC;

      SELECT
        DATEPART(HOUR, parsedDate) AS hourOfDay,
        COUNT_BIG(1) AS tweetCount
      FROM #filtered
      GROUP BY DATEPART(HOUR, parsedDate)
      ORDER BY DATEPART(HOUR, parsedDate) ASC;

      SELECT TOP (12)
        ISNULL(TrendName, 'Unknown') AS trendName,
        COUNT_BIG(1) AS tweetCount
      FROM #filtered
      GROUP BY ISNULL(TrendName, 'Unknown')
      ORDER BY COUNT_BIG(1) DESC;

      SELECT TOP (250)
        tweetId,
        ISNULL(ScreenName, '') AS screenName,
        ISNULL(Username, '') AS userName,
        ISNULL(TrendName, 'Unknown') AS trendName,
        ISNULL(tweetText, '') AS tweetText,
        ISNULL(source, '') AS source,
        ISNULL(retweetCount, 0) AS retweetCount,
        ISNULL(favoriteCount, 0) AS favoriteCount,
        parsedDate AS createdAt
      FROM #filtered
      ORDER BY parsedDate DESC;

      IF OBJECT_ID('tempdb..#filtered') IS NOT NULL
        DROP TABLE #filtered;
    `);

    const recordsets = analyticsResult.recordsets as unknown as unknown[];
    const summaryRows = (recordsets[0] as SummaryRow[] | undefined) ?? [];
    const dailyRows = (recordsets[1] as DailyRow[] | undefined) ?? [];
    const hourlyRows = (recordsets[2] as HourlyRow[] | undefined) ?? [];
    const trendRows = (recordsets[3] as TrendRow[] | undefined) ?? [];
    const tweetRows = (recordsets[4] as TweetRow[] | undefined) ?? [];

    const summary = summaryRows[0] ?? {
      totalTweets: 0,
      firstTweetAt: null,
      latestTweetAt: null,
      activeDays: 0,
      uniqueTrends: 0,
    };

    const dailyVolume = dailyRows.map((row) => ({
      dayLabel: row.dayLabel,
      tweetCount: safeNumber(row.tweetCount),
    }));

    const hourlyMap = new Map<number, number>();
    hourlyRows.forEach((row) => {
      hourlyMap.set(safeNumber(row.hourOfDay), safeNumber(row.tweetCount));
    });

    const hourlyVolume: HourlyTweetPoint[] = Array.from({ length: 24 }, (_value, hour) => ({
      hourLabel: `${String(hour).padStart(2, "0")}:00`,
      tweetCount: hourlyMap.get(hour) ?? 0,
    }));

    const trendDistribution = trendRows.map((row) => ({
      trendName: row.trendName,
      tweetCount: safeNumber(row.tweetCount),
    }));

    const tweets = tweetRows.map((row) => ({
      tweetId: row.tweetId == null ? "N/A" : String(row.tweetId),
      screenName: row.screenName?.trim() || profileRow.screenName?.trim() || "Unknown",
      userName: row.userName?.trim() || "Unknown",
      trendName: row.trendName?.trim() || "Unknown",
      tweetText: row.tweetText?.trim() || "",
      source: row.source?.trim() || "Unknown",
      retweetCount: safeNumber(row.retweetCount),
      favoriteCount: safeNumber(row.favoriteCount),
      createdAt: formatDateTime(row.createdAt),
    }));

    const availableTrends = [...new Set(trendRows.map((row) => row.trendName).filter(Boolean))].sort((a, b) =>
      a.localeCompare(b),
    );

    const profile: UserProfile = {
      screenName: profileRow.screenName?.trim() || "Unknown",
      userLocation: profileRow.userLocation?.trim() || "Unknown location",
      lastUpdated: formatDateTime(profileRow.lastUpdated),
      totalTweets: safeNumber(summary.totalTweets),
      firstTweetAt: formatDateTime(summary.firstTweetAt),
      latestTweetAt: formatDateTime(summary.latestTweetAt),
      activeDays: safeNumber(summary.activeDays),
      uniqueTrends: safeNumber(summary.uniqueTrends),
    };

    return {
      query,
      selectedStartDate: startDate,
      selectedEndDate: endDate,
      selectedTrendName: trendName,
      selectedKeyword: keyword,
      profile,
      availableTrends,
      dailyVolume,
      hourlyVolume,
      trendDistribution,
      tweets,
      userRanking,
      warning: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown search data error";
    return emptyResult(safeFilters, `Search data fallback enabled: ${message}`);
  }
}
