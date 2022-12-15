import { getTokensProvision } from '@/providers/tokens.provider';

/**
 * useTokens Composable
 * Interface to all token static and dynamic metadata.
 */
export default function useTokens() {
  return getTokensProvision();
}
