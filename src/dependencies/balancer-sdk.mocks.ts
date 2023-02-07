import { initBalancer } from '@/dependencies/balancer-sdk';
// eslint-disable-next-line no-restricted-imports
import { balancer } from '@/lib/balancer.sdk';
import { SubgraphPoolBase, SwapInfo } from '@balancer-labs/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { mockDeep } from 'vitest-mock-extended';

type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export const defaultTokenUSDPrice = '1';
export const defaultTokenEthPrice = '0.005';

export const mockedTokenPrice = {
  usd: '1',
  eth: '0.005',
};

// TODO: move to sor mocks to subfile
//TODO: Improve builder to avoid DeepPartial
export const defaultSorPools: DeepPartial<SubgraphPoolBase[]> = [
  {
    id: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
    address: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5',
    tokens: [
      {
        //@ts-ignore
        id: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269-0xba485b556399123261a5f9c95d413b4f93107407',
        symbol: 'graviAURA',
        name: 'Gravitationally Bound AURA',
        decimals: 18,
        address: '0xba485b556399123261a5f9c95d413b4f93107407',
        balance: '27120.790137306811835668',
        managedBalance: '0',
        weight: '0.3334',
        priceRate: '1',
        isExemptFromYieldProtocolFee: null,
        token: {
          latestUSDPrice: '2.134056945116554709831454942129998',
          pool: null,
        },
      },
    ],
  },
  {
    id: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
    address: '0x0578292cb20a443ba1cde459c985ce14ca2bdee5',
    poolType: 'Weighted',
  },
  {
    id: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
    poolType: 'Weighted',
  },
  {
    id: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
    address: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd',
    poolType: 'Stable',
  },
];

export const defaultCostOfSwapInToken = BigNumber.from(1);

//TODO: why mock is not working
// export const defaultSwapInfo = mock<SwapInfo>();
export const defaultSwapInfo: SwapInfo = {} as SwapInfo;
defaultSwapInfo.returnAmount = BigNumber.from('10');
defaultSwapInfo.returnAmountConsideringFees = BigNumber.from(20);
defaultSwapInfo.marketSp = '1';
defaultSwapInfo.swaps = [
  {
    poolId:
      '0x0578292cb20a443ba1cde459c985ce14ca2bdee5000100000000000000000269',
    assetInIndex: 0,
    assetOutIndex: 1,
    amount: '626913885852279906',
    userData: '0x',
    returnAmount: '61358184778941658212',
  },
  {
    poolId:
      '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56000200000000000000000014',
    assetInIndex: 0,
    assetOutIndex: 2,
    amount: '1373086114147720094',
    userData: '0x',
    returnAmount: '128435757025416503322',
  },
  {
    poolId:
      '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd000200000000000000000249',
    assetInIndex: 2,
    assetOutIndex: 1,
    amount: '0',
    userData: '0x',
    returnAmount: '132200045154243418753',
  },
];

defaultSwapInfo.tokenAddresses = [
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  '0x616e8bfa43f920657b3497dbf40d6b1a02d4608d',
  '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
];

export function generateBalancerSdkMock() {
  const balancerMock = mockDeep<typeof balancer>();
  balancerMock.data.tokenPrices.find.mockResolvedValue(mockedTokenPrice);
  balancerMock.sor.fetchPools.mockResolvedValue(true);

  balancerMock.sor.getPools.mockReturnValue(
    defaultSorPools as SubgraphPoolBase[]
  );

  balancerMock.sor.getCostOfSwapInToken.mockResolvedValue(
    defaultCostOfSwapInToken
  );

  balancerMock.sor.getSwaps.mockResolvedValue(defaultSwapInfo);

  return balancerMock;
}

export function initBalancerWithDefaultMocks() {
  initBalancer(generateBalancerSdkMock());
}
