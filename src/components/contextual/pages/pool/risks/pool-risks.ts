import { BoostedProtocol } from '@/composables/useBoostedPool';
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
import { capitalize } from 'lodash';

interface Risk {
  title: string;
  hash: string;
}

function aLink(title: string, hash: string) {
  return {
    title,
    hash,
  };
}

// Pool type risks
const weightedRisks = aLink('Weighted pool risks', '#weighted-pools');
const stableRisks = aLink('Stable pool risks', '#stable-pools');
const composableRisks = aLink(
  'Composable stable pool risks',
  '#composable-pools'
);
const metaStableRisks = aLink('MetaStable pool risks', '#composable-pools');
const boostedRisks = aLink('Boosted pool risks', '#boosted-pools');

// L2 risks
const arbitrumRisks = aLink('Layer 2 network risks: Arbitrum', '#arbitrum');
const polygonRisks = aLink('Layer 2 network risks: Polygon', '#polygon');
const optimismRisks = aLink('Layer 2 network risks: Optimism', '#optimism');
const gnosisRisks = aLink('Layer 2 network risks: Gnosis', '#gnosis');

// Mutable risks
const mutableRisks = aLink(
  'Mutable attributes risks',
  '#mutable-attributes-risk'
);

export function riskLinks(pool: Pool) {
  const result: Risk[] = [];

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

  return result;
}

export function generateThirdPartyComposabilityRisks(pool): Risk | undefined {
  const protocols = boostedProtocols(pool);

  if (
    protocols?.includes(BoostedProtocol.Tetu) ||
    protocols?.includes(BoostedProtocol.Idle)
  )
    return aLink(
      'Third party DeFi composability risks: May use multiple yield protocols',
      '#composability-risk'
    );

  if (protocols?.includes(BoostedProtocol.Reaper))
    protocols.push(BoostedProtocol.Granary);

  if (protocols) {
    return aLink(
      `Third party DeFi composability risks: ${protocols
        .map(protocol => capitalize(protocol))
        .join(', ')}`,
      '#composability-risk'
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
  if (poolSpecificRisks(pool)) return ' also';
  return '';
}

export function poolSpecificRisks(pool: Pool) {
  // GOERLI ID for testing
  if (
    pool.id ===
    '0x5aee1e99fe86960377de9f88689616916d5dcabe000000000000000000000467'
  )
    return 'This pool has testing specific risks.';
  return '';
}
