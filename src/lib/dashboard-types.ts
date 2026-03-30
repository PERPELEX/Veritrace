export type SentimentPoint = {
  name: "Positive" | "Negative" | "Neutral";
  value: number;
  color: string;
};

export type RatioPoint = {
  trend: string;
  positive: number;
  negative: number;
};

export type ClusterPoint = {
  x: number;
  y: number;
  z: number;
  name: string;
};

export type TopTrend = {
  name: string;
  tweets: number;
  level: "verified" | "neutral" | "high";
};

export type HeatMapPoint = {
  location: string;
  tweets: number;
  level: "low" | "medium" | "high";
};

export type OverviewData = {
  totalTweets: number;
  totalTweetsLabel: string;
  dateRangeLabel: string;
  lastScrapeLabel: string;
  surgingTrends: string[];
  sentimentData: SentimentPoint[];
  ratioData: RatioPoint[];
  clusterData: ClusterPoint[];
  heatMapData: HeatMapPoint[];
  topTrends: TopTrend[];
  accuracyScore: number;
  dataWarning: string | null;
};

export const dashboardClusterColors = ["#9acb3f", "#d9f06f", "#f7b347", "#2c98e8", "#d14ce0", "#f53274", "#2f7f76", "#f59e0b"];
