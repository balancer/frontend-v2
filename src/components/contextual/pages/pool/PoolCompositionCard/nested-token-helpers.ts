import { Pool } from '@/services/pool/types';

export function findTokenByAddress(pool: Pool, address: string) {
  return pool.tokens.find(token => token.address === address);
}

export function getUnderlyingTokens(pool: Pool, address: string) {
  const token = findTokenByAddress(pool, address);

  const underlyingTokens = token?.token.pool?.tokens || [];
  return underlyingTokens.filter(
    token => !pool.tokensList.includes(token.address)
  );
}
