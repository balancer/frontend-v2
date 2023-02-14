import { useUserPoolPercentage as originalUseUserPoolPercentage } from '@/composables/useUserPoolPercentage';
import BigNumber from 'bignumber.js';

type Result = ReturnType<typeof originalUseUserPoolPercentage>;
export function useUserPoolPercentage(): Result {
  return {
    userPoolPercentage: computed(() => new BigNumber(1.5)),
    userPoolPercentageLabel: computed(() => '0%'),
  };
}
