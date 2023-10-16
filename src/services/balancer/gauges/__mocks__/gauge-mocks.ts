import { OmniEscrowLock } from '@/composables/queries/useOmniEscrowLocksQuery';
import { PoolGauges } from '@/composables/queries/usePoolGaugesQuery';
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';
import { VotingEscrowLock } from '@/composables/queries/useVotingEscrowQuery';
import { server } from '@tests/msw/server';
import { graphql, RequestHandler } from 'msw';
import {
  aGaugeShareResponse,
  anOmniEscrowLock,
  aPoolGaugesResponse,
  aVotingEscrowLock,
} from './gauge-builders';

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
      poolAddress: '0x0297e37f1873d2dab4487aa67cd56b58e2f27875',
      isPreferentialGauge: false,
      isKilled: false,
    },
  },
];

export function mockWhenUserHasSharesInThePreferentialGauge() {
  const gaugeShare = aGaugeShareResponse();
  gaugeShare.gauge.id = defaultPreferentialGaugeAddress;

  mockGQLGaugeResponses([gaugeShare], aPoolGaugesResponse());
}

export function mockWhenUserHasSharesInANonPreferentialGauge() {
  const gaugeShare = aGaugeShareResponse();
  gaugeShare.gauge.id = defaultNonPreferentialGaugeAddress;

  mockGQLGaugeResponses([gaugeShare], aPoolGaugesResponse());
}

export function mockGQLGaugeResponses(
  gaugeShares: GaugeShare[],
  poolGauges: PoolGauges
) {
  server.use(
    graphql.query('GaugeShares', (_, res, ctx) => {
      return res(
        ctx.data({
          gaugeShares: gaugeShares,
        })
      );
    }),
    graphql.query('PoolGauges', (_, res, ctx) => {
      return res(ctx.data(poolGauges));
    })
  );
}

export const defaultOmniEscrowLocks: OmniEscrowLock[] = [];
export const defaultVotingEscrowLocks: VotingEscrowLock[] = [];

export function mockWhenNoSynchronizedNetworks() {
  const gaugeShare = aGaugeShareResponse();
  gaugeShare.gauge.id = defaultNonPreferentialGaugeAddress;

  mockGQLGaugeResponses([gaugeShare], aPoolGaugesResponse());
}

export const defaultMainnetVotingEscrowLockId = 'mainnet lock id';
export const defaultArbitrumVotingEscrowLockId = 'arbitrum lock id';

export const defaultUserAddress = '0x953185149e26faa31b1246723f00410728166931';
export const LayerZeroArbitrum = '110';
export const defaultBias = '0.198089123517832428';
export const defaultSlope = '0.000000006341958396';
export const defaultTimestamp = 1655552507;

export const defaultMainnetVotingEscrowLock = aVotingEscrowLock({
  id: defaultMainnetVotingEscrowLockId,
});

export const defaultArbitrumVotingEscrowLock = aVotingEscrowLock({
  id: defaultArbitrumVotingEscrowLockId,
});

export const defaultOmniEscrowLockArbitrum = anOmniEscrowLock({
  id: defaultArbitrumVotingEscrowLockId,
});

export function omniEscrowLocksHandler(omniEscrowLocks: OmniEscrowLock[] = []) {
  return graphql.query('OmniEscrowLocks', (_, res, ctx) => {
    return res(
      ctx.data({
        omniVotingEscrowLocks: omniEscrowLocks,
      })
    );
  });
}

export function votingEscrowLockHandler(
  mainnetEscrowLocks: VotingEscrowLock[] = [defaultMainnetVotingEscrowLock],
  arbitrumEscrowLocks: VotingEscrowLock[] = [defaultArbitrumVotingEscrowLock]
) {
  return graphql.query('VotingEscrowLocks', (req, res, ctx) => {
    // Default is mainnet
    let locks: VotingEscrowLock[] = mainnetEscrowLocks;

    if (req.url.pathname.includes('arbitrum')) locks = arbitrumEscrowLocks;

    return res(
      ctx.data({
        votingEscrowLocks: locks,
      })
    );
  });
}

export function mockVotingEscrowLocks(
  mainnetEscrowLocks: VotingEscrowLock[],
  arbitrumEscrowLocks: VotingEscrowLock[]
) {
  return mockGQL(
    votingEscrowLockHandler(mainnetEscrowLocks, arbitrumEscrowLocks)
  );
}

export function mockOmniEscrowLocks(omniEscrowLocks: OmniEscrowLock[]) {
  return mockGQL(omniEscrowLocksHandler(omniEscrowLocks));
}

export function mockGQL(
  gqlResponseMocks: Array<RequestHandler> | RequestHandler
) {
  if (Array.isArray(gqlResponseMocks)) return server.use(...gqlResponseMocks);
  server.use(gqlResponseMocks);
}
