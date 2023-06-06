import { OmniEscrowLock } from '@/composables/queries/useOmniEscrowLocksQuery';
import { PoolGauges } from '@/composables/queries/usePoolGaugesQuery';
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';
import { VotingEscrowLock } from '@/composables/queries/useVotingEscrowQuery';
import {
  defaultBias,
  defaultGaugeBalance,
  defaultNonPreferentialGaugeAddress,
  defaultPoolId,
  defaultPreferentialGaugeAddress,
  defaultSlope,
  defaultTimestamp,
  defaultTotalSupply,
  defaultUserAddress,
  LayerZeroArbitrum,
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

export function aVotingEscrowLock(
  ...options: Partial<VotingEscrowLock>[]
): VotingEscrowLock {
  const defaultLock = {
    id: 'test voting escrow id',
    bias: defaultBias,
    slope: defaultSlope,
    timestamp: defaultTimestamp,
  };
  return Object.assign({}, defaultLock, ...options);
}

export function anOmniEscrowLock(
  ...options: Partial<OmniEscrowLock>[]
): OmniEscrowLock {
  const defaultLock = {
    id: 'ommni voting escrow id',
    bias: defaultBias,
    slope: defaultSlope,
    localUser: { id: defaultUserAddress },
    remoteUser: 'remoteUserId',
    dstChainId: LayerZeroArbitrum,
  };
  return Object.assign({}, defaultLock, ...options);
}
