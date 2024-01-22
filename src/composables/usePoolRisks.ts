import { Protocol } from '@/composables/useProtocols';
import {
  isArbitrum,
  isGnosis,
  isOptimism,
  isPolygon,
} from '@/composables/useNetwork';
import {
  boostedProtocols,
  isBoosted,
  isComposableStable,
  isMetaStable,
  isStable,
  isWeighted,
} from '@/composables/usePoolHelpers';
import { POOLS } from '@/constants/pools';
import { Pool } from '@/services/pool/types';
import { RiskKey } from '@/types/pools';
import { capitalize } from 'lodash';

export const riskTitles = {
  [RiskKey.General]: 'General Balancer protocol risks',
  [RiskKey.Weighted]: 'Weighted pool risks',
  [RiskKey.Stable]: 'Stable pool risks',
  [RiskKey.ComposableStable]: 'Composable stable pool risks',
  [RiskKey.MetaStable]: 'MetaStable pool risks',
  [RiskKey.Boosted]: 'Boosted pool risks',
  [RiskKey.Arbitrum]: 'Layer 2 network risks: Arbitrum',
  [RiskKey.Polygon]: 'Layer 2 network risks: Polygon',
  [RiskKey.Optimism]: 'Layer 2 network risks: Optimism',
  [RiskKey.Gnosis]: 'Layer 2 network risks: Gnosis',
  [RiskKey.Mutable]: 'Mutable attributes risks',
  [RiskKey.Composability]: 'Composability risks',
  [RiskKey.RateProvider]: 'Rate provider risks',
  [RiskKey.RateProviderBridge]:
    'Rate provider cross-chain bridge risks: Layer Zero',
};

export interface Risk {
  title: string;
  hash: string;
}

function aLink(key: RiskKey, title?: string) {
  return {
    title: title || riskTitles[key],
    hash: `#${key}`,
  };
}

// Pool type risks
const weightedRisks = aLink(RiskKey.Weighted);
const stableRisks = aLink(RiskKey.Stable);
const composableRisks = aLink(
  RiskKey.ComposableStable,
  // Explicit title because RiskKey.ComposableStable and RiskKey.MetaStable share the same key (hash)
  'Composable Stable pool risks'
);
const metaStableRisks = aLink(
  RiskKey.ComposableStable,
  riskTitles[RiskKey.MetaStable]
);
const boostedRisks = aLink(RiskKey.Boosted);
const arbitrumRisks = aLink(RiskKey.Arbitrum);
const polygonRisks = aLink(RiskKey.Polygon);
const optimismRisks = aLink(RiskKey.Optimism);
const gnosisRisks = aLink(RiskKey.Gnosis);
const mutableRisks = aLink(RiskKey.Mutable);
const rateProviderRisks = aLink(RiskKey.RateProvider);

export function riskLinks(pool: Pool): Risk[] {
  const result: Risk[] = [];

  if (pool.priceRateProviders && pool.priceRateProviders.length > 0)
    result.push(rateProviderRisks);

  if (isWeighted(pool.poolType)) result.push(weightedRisks);
  if (isStable(pool.poolType)) result.push(stableRisks);
  if (isComposableStable(pool.poolType)) result.push(composableRisks);
  if (isMetaStable(pool.poolType)) result.push(metaStableRisks);

  if (isBoosted(pool)) {
    result.push(boostedRisks);
    const thirdPartyRisks = generateThirdPartyComposabilityRisks(pool);
    if (thirdPartyRisks) result.push(thirdPartyRisks);
  }

  if (isArbitrum.value) result.push(arbitrumRisks);
  if (isOptimism.value) result.push(optimismRisks);
  if (isPolygon.value) result.push(polygonRisks);
  if (isGnosis.value) result.push(gnosisRisks);

  if (hasOwner(pool)) result.push(mutableRisks);

  result.push(aLink(RiskKey.General));

  return result;
}

export function generateThirdPartyComposabilityRisks(pool): Risk | undefined {
  const protocols = boostedProtocols(pool);

  if (protocols?.includes(Protocol.Tetu) || protocols?.includes(Protocol.Idle))
    return aLink(
      RiskKey.Composability,
      'Third party DeFi composability risks: May use multiple yield protocols'
    );

  if (protocols?.includes(Protocol.Reaper)) protocols.push(Protocol.Granary);

  if (protocols) {
    return aLink(
      RiskKey.Composability,
      `Third party DeFi composability risks: ${protocols
        .map(protocol => capitalize(protocol))
        .join(', ')}`
    );
  }
}

function hasOwner(pool) {
  return ![undefined, POOLS.ZeroAddress].includes(pool?.owner);
}

export function risksTitle(pool: Pool) {
  return `Liquidity Providers in this pool${alsoWhenSpecificRisks(
    pool
  )} face the following risks:`;
}

function alsoWhenSpecificRisks(pool: Pool) {
  if (poolSpecificRisks(pool).length > 0) return ' also';
  return '';
}

export function poolSpecificRisks(pool: Pool): Risk[] {
  const risks = POOLS?.Risks?.[pool.id.toLowerCase()];

  if (risks) {
    return risks.map(risk => aLink(risk));
  }

  return [];
}
