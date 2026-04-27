import { apiClient } from './client';

export type StatsPeriod = 'WEEKLY' | 'MONTHLY';

export interface DailyBreakdown {
  date: string;
  seconds: number;
}

export interface TopKeyword {
  keyword: string;
  count: number;
}

export interface StatsResponse {
  period: string;
  totalSeconds: number;
  dailyBreakdown: DailyBreakdown[];
  topKeywords: TopKeyword[];
}

export async function fetchStats(period: StatsPeriod): Promise<StatsResponse> {
  const res = await apiClient.get<StatsResponse>('/api/stats/me', {
    params: { period },
  });
  return res.data;
}
