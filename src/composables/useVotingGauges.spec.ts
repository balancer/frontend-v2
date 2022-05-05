import { mount } from 'vue-composable-tester';

import useVotingGauges from './useVotingGauges';

jest.mock('@/composables/queries/useGaugeVotesQuery');
jest.mock('@/services/web3/useWeb3');

describe('useVotingGauges', () => {
  describe('votingPeriodEnd', () => {
    beforeAll(() => {
      jest.useFakeTimers('modern');
    });

    it('Should work for an arbitrary time', () => {
      jest.setSystemTime(Date.UTC(2022, 3, 23, 15, 24, 38)); // Sun Apr 23 2022 15:24:38 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([4, 8, 35, 22]);
    });

    it('Should return 0d on countdown timer for a wednesday', () => {
      jest.setSystemTime(Date.UTC(2022, 3, 27, 23, 20, 2)); // Wed Apr 27 2022 23:20:02 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 39, 58]);
    });

    it('Should return 1s just before the next period', () => {
      jest.setSystemTime(Date.UTC(2022, 3, 27, 23, 59, 59)); // Wed Apr 27 2022 23:59:59 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 0, 1]);
    });

    it('Should return all zeros at midnight Thursday morning', () => {
      jest.setSystemTime(Date.UTC(2022, 3, 28, 0, 0, 0)); // Thu Apr 28 2022 00:00:00 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 0, 0]);
    });

    it('Should return 6d 23h, 59m, 59s just after the next period', () => {
      jest.setSystemTime(Date.UTC(2022, 3, 28, 0, 0, 1)); // Thu Apr 28 2022 00:00:01 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([6, 23, 59, 59]);
    });

    afterAll(() => {
      jest.useRealTimers();
    });
  });
});
