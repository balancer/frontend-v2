import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mount } from '@tests/mount-composable-tester';

import useVotingPools from './useVotingPools';

initDependenciesWithDefaultMocks();

vi.mock('@/composables/queries/useVotingPoolsQuery');
vi.mock('@/services/web3/useWeb3');

describe('useVotingPools', () => {
  describe('votingPeriodEnd', () => {
    it('Should work for an arbitrary time', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 23, 15, 24, 38)); // Sun Apr 23 2022 15:24:38 GMT+0000
      const { result } = mount(() => useVotingPools());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([4, 8, 35, 22]);
    });

    it('Should return 0d on countdown timer for a wednesday', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 27, 23, 20, 2)); // Wed Apr 27 2022 23:20:02 GMT+0000
      const { result } = mount(() => useVotingPools());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 39, 58]);
    });

    it('Should return 1s just before the next period', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 27, 23, 59, 59)); // Wed Apr 27 2022 23:59:59 GMT+0000
      const { result } = mount(() => useVotingPools());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 0, 1]);
    });

    it('Should return all zeros at midnight Thursday morning', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 28, 0, 0, 0)); // Thu Apr 28 2022 00:00:00 GMT+0000
      const { result } = mount(() => useVotingPools());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 0, 0]);
    });

    it('Should return 6d 23h, 59m, 59s just after the next period', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 28, 0, 0, 1)); // Thu Apr 28 2022 00:00:01 GMT+0000
      const { result } = mount(() => useVotingPools());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([6, 23, 59, 59]);
    });
  });
});
