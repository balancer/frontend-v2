import {
  GqlChain,
  GqlPoolMinimalType as GqlPoolType,
} from '@/services/api/graphql/generated/api-types';
import { ApiVotingPool } from '@/services/balancer/gauges/gauge-controller.decorator';

/*
 Fake voting Pool data to test voting list UI in testnet networks
*/
export function testnetVotingPools(
  testnet: 'SEPOLIA' | 'GOERLI'
): ApiVotingPool[] {
  const veBal: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0xf8a0623ab66f985effc1c69d05f1af4badb01b00000200000000000000000060',
    address: '0xf8a0623ab66F985EfFc1C69D05F1af4BaDB01b00',
    type: GqlPoolType.Stable,
    symbol: 'veBAL',
    tokens: [
      {
        address: '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
        weight: null,
        symbol: 'veBAL',
        logoURI:
          'https://raw.githubusercontent.com/balancer/assets/master/assets/0x5c6ee304399dbdb9c8ef030ab642b10820db8f56.png',
      },
    ],
    gauge: {
      address: '0xF2ca6F8961e91F1ee0D688F9926183314D866f1E',
      isKilled: false,
      addedTimestamp: 1654312627,
      relativeWeightCap: null,
    },
  };

  const weightedPool: ApiVotingPool = {
    chain: testnet as GqlChain,
    id: '0x16faf9f73748013155b7bc116a3008b57332d1e600020000000000000000005b',
    address: '0x16faF9f73748013155B7bC116a3008b57332D1e6',
    type: GqlPoolType.Weighted,
    symbol: 'B-50WBTC-50WETH',
    tokens: [
      {
        address: '0x37f03a12241E9FD3658ad6777d289c3fb8512Bc9',
        weight: '0.5',
        symbol: 'WBTC',
        logoURI: '',
      },
      {
        address: '0xdFCeA9088c8A88A76FF74892C1457C17dfeef9C1',
        weight: '0.5',
        symbol: 'WETH',
        logoURI: '',
      },
    ],
    gauge: {
      address: '0xf0f572ad66baacDd07d8c7ea3e0E5EFA56a76081',
      isKilled: false,
      relativeWeightCap: null,
      addedTimestamp: 1654312702,
    },
  };

  return [veBal, weightedPool];
}
