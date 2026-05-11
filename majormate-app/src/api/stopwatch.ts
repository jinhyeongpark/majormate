import { apiClient } from './client';

export async function syncStopwatchStart(params?: { keyword?: string; allowQuestion?: boolean }): Promise<void> {
  await apiClient.post('/api/stopwatch/start', {
    roomId: null,
    keyword: params?.keyword ?? null,
    allowQuestion: params?.allowQuestion ?? false,
  });
}

export async function syncStopwatchPause(): Promise<void> {
  await apiClient.post('/api/stopwatch/pause');
}

export async function syncStopwatchResume(): Promise<void> {
  await apiClient.post('/api/stopwatch/resume');
}

export async function syncStopwatchEnd(): Promise<void> {
  await apiClient.post('/api/stopwatch/end');
}
