import { orderedPoolTokens } from '@/composables/usePool';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';

export function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(
    gauge.pool.poolType,
    gauge.pool.address,
    gauge.pool.tokens
  );
  return sortedTokens.map(
    token => gauge.tokenLogoURIs[token?.address || ''] || ''
  );
}
