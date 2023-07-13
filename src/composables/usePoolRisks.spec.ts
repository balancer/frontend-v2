import { aBoostedPool } from '@/__mocks__/boosted-pool';
import {
  generateThirdPartyComposabilityRisks,
  riskLinks,
  risksTitle,
} from './usePoolRisks';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { aPool } from '@tests/unit/builders/pool.builders';
import { PoolType } from '@sobal/sdk';
import { networkId } from '@/composables/useNetwork';
import { Network } from '@/lib/config';
import { POOLS } from '@/constants/pools';
import {
  idleBoostedPoolId,
  poolIdWithTwoBoostedProtocols,
  reaperBoostedPoolId,
  tetuBoostedPoolId,
} from '@/lib/config/goerli/pools';

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
    expect(riskLinks(aBoostedPool({ id: poolIdWithTwoBoostedProtocols })))
      .toMatchInlineSnapshot(`
      [
        {
          "hash": "#boosted-pools",
          "title": "Boosted pool risks",
        },
        {
          "hash": "#composability-risk",
          "title": "Third party DeFi composability risks: Aave, Morpho",
        },
        {
          "hash": "#general-risks",
          "title": "General Balancer protocol risks",
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
        {
          "hash": "#general-risks",
          "title": "General Balancer protocol risks",
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
        {
          "hash": "#general-risks",
          "title": "General Balancer protocol risks",
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
            "title": "Composable Stable pool risks",
          },
          {
            "hash": "#gnosis",
            "title": "Layer 2 network risks: Gnosis",
          },
          {
            "hash": "#general-risks",
            "title": "General Balancer protocol risks",
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
          {
            "hash": "#general-risks",
            "title": "General Balancer protocol risks",
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

describe('When generates multi-protocol risks links', () => {
  test('Reaper shows Granary (as it uses it underneath)', () => {
    expect(
      generateThirdPartyComposabilityRisks(aPool({ id: reaperBoostedPoolId }))
    ).toMatchInlineSnapshot(`
    {
      "hash": "#composability-risk",
      "title": "Third party DeFi composability risks: Reaper, Granary",
    }
  `);
  });

  test('Tetu can use other protocols underneath', () => {
    expect(
      generateThirdPartyComposabilityRisks(aPool({ id: tetuBoostedPoolId }))
    ).toMatchInlineSnapshot(`
      {
        "hash": "#composability-risk",
        "title": "Third party DeFi composability risks: May use multiple yield protocols",
      }
    `);
  });

  test('Idle can use other protocols underneath', () => {
    expect(
      generateThirdPartyComposabilityRisks(aPool({ id: idleBoostedPoolId }))
    ).toMatchInlineSnapshot(`
      {
        "hash": "#composability-risk",
        "title": "Third party DeFi composability risks: May use multiple yield protocols",
      }
    `);
  });
});
