import { PoolGauges } from '@/composables/queries/usePoolGaugesQuery';
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';

export const defaultPoolId =
  '0xe053685f16968a350c8dea6420281a41f72ce3aa00020000000000000000006b';
export const defaultGaugeBalance = '50';
export const defaultTotalSupply = '10000';

export const defaultPreferentialGaugeAddress =
  '0xf752dd899f87a91370c1c8ac1488aef6be687505';
export const defaultNonPreferentialGaugeAddress =
  '0xa280e104deccc87065600bbd5a904c8e82a7ae89';

export const defaultPoolGauges: PoolGauges = {
  __name: 'PoolGauges',
  pool: {
    preferentialGauge: { id: defaultPreferentialGaugeAddress },
    gauges: [
      {
        id: '0xf752dd899f87a91370c1c8ac1488aef6be687505',
        relativeWeightCap: '',
      },
    ],
  },
  liquidityGauges: [{ id: '0xf752dd899f87a91370c1c8ac1488aef6be687505' }],
};

export const defaultGaugeShares: GaugeShare[] = [
  {
    balance: defaultGaugeBalance,
    gauge: {
      id: 'gauge id',
      poolId: defaultPoolId,
      totalSupply: defaultTotalSupply,
    },
  },
];
