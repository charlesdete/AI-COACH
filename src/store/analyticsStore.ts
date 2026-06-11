import { create } from 'zustand';
import { AnalyticsOverview } from '../shared/types/analytics';

interface AnalyticsState {
  analyticsData: AnalyticsOverview | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  
  setAnalyticsData: (data: AnalyticsOverview | null) => void;
  setIsLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastUpdated: (timestamp: string) => void;
  clearAnalytics: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analyticsData: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  setAnalyticsData: (data) => set({ analyticsData: data }),
  setIsLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setLastUpdated: (timestamp) => set({ lastUpdated: timestamp }),
  
  clearAnalytics: () => set({
    analyticsData: null,
    error: null,
    lastUpdated: null,
  }),
}));
