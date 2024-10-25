/**
 * Provides user data on wallet connection or change.
 *
 * Fetch any user data that needs to be generally accessible here.
 */
import useStakedSharesQuery from '@/composables/queries/useStakedSharesQuery';
import useUserBoostsQuery from '@/composables/queries/useUserBoostsQuery';
import useUserGaugeSharesQuery from '@/composables/queries/useUserGaugeSharesQuery';
import useVeBalLockInfoQuery from '@/composables/queries/useVeBalLockInfoQuery';
import symbolKeys from '@/constants/symbol.keys';
import { InjectionKey, provide } from 'vue';
import { safeInject } from './inject';

export const userDataProvider = () => {
  /**
   * COMPOSABLES
   */
  // Fetch all user's pool shares.
  // const userPoolSharesQuery = useUserPoolSharesQuery();

  // Fetches all user's gaugeShares.
  const userGaugeSharesQuery = useUserGaugeSharesQuery();
  const { data: userGaugeShares } = userGaugeSharesQuery;

  // Fetch all user's staked share balances via onchain multicall.
  const stakedSharesQuery = useStakedSharesQuery(userGaugeShares);

  // Fetches map of boost values for user's staked shares.
  const userBoostsQuery = useUserBoostsQuery(userGaugeShares);

  const lockQuery = useVeBalLockInfoQuery();

  return {
    // userPoolSharesQuery,
    userGaugeSharesQuery,
    stakedSharesQuery,
    userBoostsQuery,
    lockQuery,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type UserDataResponse = ReturnType<typeof userDataProvider>;
export const UserDataProviderSymbol: InjectionKey<UserDataResponse> = Symbol(
  symbolKeys.Providers.UserData
);

export function provideUserData() {
  provide(UserDataProviderSymbol, userDataProvider());
}

export function useUserData(): UserDataResponse {
  return safeInject(UserDataProviderSymbol);
}
