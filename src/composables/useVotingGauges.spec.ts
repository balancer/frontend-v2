import { mount } from 'vue-composable-tester';

import useVotingGauges from './useVotingGauges';

jest.mock('@/composables/queries/useGaugeVotesQuery');
jest.mock('@/services/web3/useWeb3');

describe('useVotingGauges', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern');
  });

  it('Should return 0d on countdown timer for a wednesday', () => {
    jest.setSystemTime(Date.UTC(2022, 3, 27, 23, 20, 2)); // Wed Apr 27 2022 23:20:02 GMT+0000
    const { result } = mount(() => useVotingGauges());
    const { votingPeriodEnd } = result;
    expect(votingPeriodEnd.value).toEqual([0, 0, 39, 58]);
  });

  afterAll(() => {
    jest.useRealTimers();
  });
});
