import type { Campaign } from "./campaign";
import type { Payment } from "./payment";

export interface DashboardMetrics {
  totalStudents: number;
  paidStudents: number;
  unpaidStudents: number;
  flaggedPayments: number;
  totalExpected: number;
  totalCollected: number;
  outstandingBalance: number;
  collectionPercentage: number;
  statusBreakdown: {
    successful: number;
    pending: number;
    failed: number;
    expired: number;
    flagged: number;
  };
}

export interface CampaignDashboard {
  campaign: Campaign;
  metrics: DashboardMetrics;
  recentPayments: Payment[];
}

export interface CollectionTimeseriesPoint {
  date: string; // "YYYY-MM-DD"
  cumulativeAmount: number;
}

export interface CollectionTimeseries {
  series: CollectionTimeseriesPoint[];
  target: number;
}