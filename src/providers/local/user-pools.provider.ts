import { InjectionKey } from 'vue';
import { UserStakingResponse } from '@/providers/local/user-staking.provider';
import symbolKeys from '@/constants/symbol.keys';
import { safeInject } from '../inject';
/**
 * Provides user pools data. Primarily for the portfolio page.
 */
export const provider = (userStaking: UserStakingResponse) => {
  const { stakedPools, refetchStakedPools } = userStaking;

  // Trigger refetch of queries for staked and unstaked pools.
  async function refetchAllUserPools() {
    await Promise.all([refetchStakedPools()]);
  }

  return {
    stakedPools,
    // unstakedPools,
    // userPoolShares,
    // totalFiatValue,
    // isLoading,
    refetchAllUserPools,
  };
};

export type UserPoolsProviderResponse = ReturnType<typeof provider>;
export const UserPoolsProviderSymbol: InjectionKey<UserPoolsProviderResponse> =
  Symbol(symbolKeys.Providers.UserPools);

export function providerUserPools(userStaking: UserStakingResponse) {
  provide(UserPoolsProviderSymbol, provider(userStaking));
}

export function useUserPools(): UserPoolsProviderResponse {
  return safeInject(UserPoolsProviderSymbol);
}
