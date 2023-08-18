import { VeBalLockInfo } from '@/services/balancer/contracts/contracts/veBAL';

const defaultVeBalLockInfo: VeBalLockInfo = {
  lockedAmount: '0.1',
  hasExistingLock: false,
} as VeBalLockInfo;

export default function useVeBalLockInfoQuery() {
  return {
    data: defaultVeBalLockInfo,
    isLoading: false,
  };
}
