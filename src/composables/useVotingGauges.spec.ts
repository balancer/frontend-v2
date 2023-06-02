import { mount } from '@tests/mount-composable-tester';

import { MAINNET_VOTING_GAUGES, VotingGauge } from '@/constants/voting-gauges';
import useVotingGauges from './useVotingGauges';
import {
  aVotingGauge,
  aWeightedVotingGauge,
} from '@/components/contextual/pages/vebal/LMVoting/__mocks__/voting-builders';

vi.mock('@/composables/queries/useGaugeVotesQuery');
vi.mock('@/services/web3/useWeb3');

describe('useVotingGauges', () => {
  describe('votingPeriodEnd', () => {
    beforeAll(() => {
      vi.useFakeTimers();
    });

    it('Should work for an arbitrary time', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 23, 15, 24, 38)); // Sun Apr 23 2022 15:24:38 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([4, 8, 35, 22]);
    });

    it('Should return 0d on countdown timer for a wednesday', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 27, 23, 20, 2)); // Wed Apr 27 2022 23:20:02 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 39, 58]);
    });

    it('Should return 1s just before the next period', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 27, 23, 59, 59)); // Wed Apr 27 2022 23:59:59 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 0, 1]);
    });

    it('Should return all zeros at midnight Thursday morning', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 28, 0, 0, 0)); // Thu Apr 28 2022 00:00:00 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([0, 0, 0, 0]);
    });

    it('Should return 6d 23h, 59m, 59s just after the next period', () => {
      vi.setSystemTime(Date.UTC(2022, 3, 28, 0, 0, 1)); // Thu Apr 28 2022 00:00:01 GMT+0000
      const { result } = mount(() => useVotingGauges());
      const { votingPeriodEnd } = result;
      expect(votingPeriodEnd.value).toEqual([6, 23, 59, 59]);
    });

    afterAll(() => {
      vi.useRealTimers();
    });
  });
});

test('Should get voting gauges list from API', () => {
  const mainnetGauges = MAINNET_VOTING_GAUGES as VotingGauge[];

  expect(mainnetGauges[0]).toMatchInlineSnapshot(`
    {
      "addedTimestamp": 1648465251,
      "address": "0xE867AD0a48e8f815DC0cda2CDb275e0F163A480b",
      "isKilled": false,
      "network": 1,
      "pool": {
        "address": "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56",
        "id": "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014",
        "poolType": "Stable",
        "symbol": "veBAL",
        "tokens": [
          {
            "address": "0xc128a9954e6c874ea3d62ce62b468ba073093f25",
            "symbol": "veBAL",
            "weight": "null",
          },
        ],
      },
      "relativeWeightCap": "null",
      "tokenLogoURIs": {
        "0xc128a9954e6c874ea3d62ce62b468ba073093f25": "https://raw.githubusercontent.com/balancer/assets/master/assets/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png",
      },
    }
  `);
});

test('Should get voting gauges list from API2', () => {
  const mainnetGauges: VotingGauge[] = [aVotingGauge(), aWeightedVotingGauge()];

  expect(mainnetGauges[0]).toMatchInlineSnapshot(`
    {
      "addedTimestamp": 1648465251,
      "address": "0xE867AD0a48e8f815DC0cda2CDb275e0F163A480b",
      "network": 1,
      "pool": {
        "address": "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56",
        "id": "0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014",
        "poolType": "Stable",
        "symbol": "veBAL",
        "tokens": [
          {
            "_isMockObject": true,
            "address": "0xc128a9954e6c874ea3d62ce62b468ba073093f25",
            "symbol": "veBAL",
            "weight": "null",
          },
        ],
      },
      "relativeWeightCap": "null",
      "tokenLogoURIs": {
        "0xc128a9954e6c874ea3d62ce62b468ba073093f25": "https://raw.githubusercontent.com/balancer/assets/master/assets/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png",
      },
    }
  `);
  expect(mainnetGauges[1]).toMatchInlineSnapshot(`
    {
      "addedTimestamp": 1648465251,
      "address": "0x896596539966e06beea751801cf15f7aad0aa6c8",
      "network": 1,
      "pool": {
        "address": "0x9ee0af1ee0a0782daf5f1af47fd49b2a766bd8d4",
        "id": "0x45a0623ab66f985effc1c69d05f1af4badb01b00000200000000001230000060",
        "poolType": "Weighted",
        "symbol": "TEST VOTING WEIGHTED POOL",
        "tokens": [
          {
            "_isMockObject": true,
            "address": "0x3Ec8798B81485A254928B70CDA1cf0A2BB0B74D7",
            "balance": "408784.606604112667634055",
            "symbol": "GRO",
            "token": {
              "latestUSDPrice": "1.07",
              "pool": null,
            },
            "weight": "0.8",
          },
          {
            "_isMockObject": true,
            "address": "0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1",
            "balance": "95.094102533755196937",
            "symbol": "WETH",
            "token": {
              "latestUSDPrice": "1.07",
              "pool": null,
            },
            "weight": "0.2",
          },
        ],
      },
      "relativeWeightCap": "null",
      "tokenLogoURIs": {
        "0xc128a9954e6c874ea3d62ce62b468ba073093f25": "https://raw.githubusercontent.com/balancer/assets/master/assets/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png",
      },
    }
  `);
});
