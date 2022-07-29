import { twentyFourHoursInMs } from '@/composables/useTime';

export const FETCH_ONCE_OPTIONS = {
  refetchOnMount: false,
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  staleTime: twentyFourHoursInMs,
};
