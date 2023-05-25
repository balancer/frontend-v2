import { PoolGauges } from '@/composables/queries/usePoolGaugesQuery';
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';
import {
  defaultGaugeBalance,
  defaultNonPreferentialGaugeAddress,
  defaultPoolId,
  defaultPreferentialGaugeAddress,
  defaultTotalSupply,
} from './gauge-mocks';

export function aPoolGaugesResponse(
  ...options: Partial<PoolGauges>[]
): PoolGauges {
  const defaultPoolGauges: PoolGauges = {
    __name: 'PoolGauges',
    pool: {
      preferentialGauge: { id: defaultPreferentialGaugeAddress },
      gauges: [
        {
          id: defaultPreferentialGaugeAddress,
          relativeWeightCap: '',
        },
        {
          id: defaultNonPreferentialGaugeAddress,
          relativeWeightCap: '',
        },
      ],
    },
    liquidityGauges: [
      { id: defaultPreferentialGaugeAddress },
      { id: defaultNonPreferentialGaugeAddress },
    ],
  };
  return Object.assign({}, defaultPoolGauges, ...options);
}

export function aGaugeShareResponse(
  ...options: Partial<GaugeShare>[]
): GaugeShare {
  const defaultGaugeShare = {
    balance: defaultGaugeBalance,
    gauge: {
      id: 'gauge id',
      poolId: defaultPoolId,
      totalSupply: defaultTotalSupply,
    },
  };
  return Object.assign({}, defaultGaugeShare, ...options);
}
