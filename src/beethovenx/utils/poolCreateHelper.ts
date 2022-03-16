import { sumBy, uniqBy } from 'lodash';
import { BalanceMap } from '@/services/token/concerns/balances.concern';
import { TokenInfoMap } from '@/types/TokenList';
import { PoolTokenInput } from '@/beethovenx/services/pool/creator/pool-creator.service';

export function getTokensErrorFromInputs(
  poolTokens: PoolTokenInput[],
  tokens: TokenInfoMap,
  balances: BalanceMap,
  approvedTokens: string[],
  approvalRequired: (tokenAddress: string, amount: string) => boolean
) {
  const totalWeight = sumBy(poolTokens, token => parseFloat(token.weight));

  if (totalWeight < 99.99 || totalWeight > 100.01) {
    return {
      header: 'Weights must add up to approx 100%',
      body: 'Your token weights do no add up to 100%'
    };
  }

  for (const poolToken of poolTokens) {
    if (!poolToken.weight || parseFloat(poolToken.weight) < 1) {
      return {
        header: 'All tokens must have a minimum weight of 1%',
        body: 'One or more of your tokens does not have a valid weight'
      };
    }

    if (!poolToken.amount || parseFloat(poolToken.amount) === 0) {
      return {
        header: 'All tokens must have an initial amount',
        body: 'One or more of your tokens does not have a valid initial amount'
      };
    }

    if (
      parseFloat(poolToken.amount) > parseFloat(balances[poolToken.address])
    ) {
      return {
        header: 'An initial amount exceeds your balance',
        body: 'One or more of your input amounts exceeds your token balance'
      };
    }

    if (tokens[poolToken.address]) {
      const requiresApproval = approvalRequired(
        poolToken.address,
        poolToken.amount
      );

      if (requiresApproval && !approvedTokens.includes(poolToken.address)) {
        return {
          header: 'A token requires approval',
          body: 'One or more of your tokens requires an approval'
        };
      }
    }
  }

  if (uniqBy(poolTokens, token => token.address).length !== poolTokens.length) {
    return {
      header: 'You have duplicate tokens',
      body: 'Each token can only appear once in your pool.'
    };
  }

  return undefined;
}
