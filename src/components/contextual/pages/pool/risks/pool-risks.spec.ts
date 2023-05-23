import { BoostedPoolMock } from '@/__mocks__/boosted-pool';
import {
  generateThirdPartyComposabilityRisks,
  riskLinks,
  risksTitle,
} from './pool-risks';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { aPool } from '@tests/unit/builders/pool.builders';
import { PoolType } from '@balancer-labs/sdk';
import { networkId } from '@/composables/useNetwork';
import { Network } from '@/lib/config';
import { POOLS } from '@/constants/pools';
import { reaperBoostedPoolId } from '@/lib/config/goerli/pools';

function withGoerli() {
  networkId.value = Network.GOERLI;
}
function withArbitrum() {
  networkId.value = Network.ARBITRUM;
}

function withPolygon() {
  networkId.value = Network.POLYGON;
}

function withGnosis() {
  networkId.value = Network.GNOSIS;
}

describe('Generates links for', () => {
  test('a boosted pool with Aave and Morph boosted protocols', () => {
    withGoerli();
    expect(riskLinks(BoostedPoolMock)).toMatchInlineSnapshot(`
      [
        {
          "hash": "#boosted-pools",
          "title": "Boosted pool risks",
        },
        {
          "hash": "#composability-risk",
          "title": "Third party DeFi composability risks: Aave, Morpho",
        },
      ]
    `);
  });

  test('a weighted pool in arbitrum with Delegate Owner (mutable risks)', () => {
    withArbitrum();
    expect(riskLinks(aWeightedPool({ owner: POOLS.DelegateOwner })))
      .toMatchInlineSnapshot(`
      [
        {
          "hash": "#weighted-pools",
          "title": "Weighted pool risks",
        },
        {
          "hash": "#arbitrum",
          "title": "Layer 2 network risks: Arbitrum",
        },
        {
          "hash": "#mutable-attributes-risk",
          "title": "Mutable attributes risks",
        },
      ]
    `);
  });

  test('an stable pool in Polygon', () => {
    withPolygon();
    expect(riskLinks(aPool({ poolType: PoolType.Stable })))
      .toMatchInlineSnapshot(`
      [
        {
          "hash": "#stable-pools",
          "title": "Stable pool risks",
        },
        {
          "hash": "#polygon",
          "title": "Layer 2 network risks: Polygon",
        },
      ]
    `);
  });

  test('a composable stable pool in Gnosis', () => {
    withGnosis();
    expect(riskLinks(aPool({ poolType: PoolType.ComposableStable })))
      .toMatchInlineSnapshot(`
      [
        {
          "hash": "#composable-pools",
          "title": "Composable stable pool risks",
        },
        {
          "hash": "#gnosis",
          "title": "Layer 2 network risks: Gnosis",
        },
      ]
    `);
  });

  test('a composable stable pool with Delegate Owner', () => {
    withGoerli();
    expect(riskLinks(aPool({ poolType: PoolType.MetaStable })))
      .toMatchInlineSnapshot(`
        [
          {
            "hash": "#composable-pools",
            "title": "MetaStable pool risks",
          },
        ]
      `);
  });
});

test('Title changes if the pool has specific risks', () => {
  expect(risksTitle(aPool())).toBe(
    'Liquidity Providers in this pool face the following risks:'
  );

  const goerliPoolWithSpecificRisks =
    '0x5aee1e99fe86960377de9f88689616916d5dcabe000000000000000000000467';
  expect(risksTitle(aPool({ id: goerliPoolWithSpecificRisks }))).toBe(
    'Liquidity Providers in this pool also face the following risks:'
  );
});

test('Generates multi-protocol risks (i.e. Reaper harvests Aave rewards)', () => {
  expect(
    generateThirdPartyComposabilityRisks(aPool({ id: reaperBoostedPoolId }))
  ).toMatchInlineSnapshot(`
    {
      "hash": "#composability-risk",
      "title": "Third party DeFi composability risks: Reaper, Aave",
    }
  `);
});
