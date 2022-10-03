import { orderedPoolTokens } from '@/composables/usePool';
import { VotingGaugeWithVotes } from '@/services/balancer/gauges/gauge-controller.decorator';
import { Pool } from '@/services/pool/types';

export function orderedTokenURIs(gauge: VotingGaugeWithVotes): string[] {
  const sortedTokens = orderedPoolTokens(gauge.pool as Pool, gauge.pool.tokens);
  return sortedTokens.map(
    token => gauge.tokenLogoURIs[token?.address || ''] || ''
  );
}
