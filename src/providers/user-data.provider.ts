/**
 * Provides user data on wallet connection or change.
 *
 * Fetch any user data that needs to be generally accessible here.
 */
import useUserBoostsQuery from '@/composables/queries/useUserBoostsQuery';
import useUserGaugeSharesQuery from '@/composables/queries/useUserGaugeSharesQuery';
import symbolKeys from '@/constants/symbol.keys';
import { inject, InjectionKey, provide, Ref, watch } from 'vue';

const provider = (account: Ref<string>) => {
  /**
   * COMPOSABLES
   */
  // Fetches all user's gaugeShares.
  const userGaugeSharesQuery = useUserGaugeSharesQuery();
  const { data: userGaugeShares } = userGaugeSharesQuery;

  // Fetches map of boost values for user's staked shares.
  const userBoostsQuery = useUserBoostsQuery(userGaugeShares);

  return {
    userGaugeSharesQuery,
    userBoostsQuery,
  };
};

/**
 * Provide setup: response type + symbol.
 */
export type Response = ReturnType<typeof provider>;
export const UserDataProviderSymbol: InjectionKey<Response> = Symbol(
  symbolKeys.Providers.UserData
);

export function provideUserData(account: Ref<string>) {
  provide(UserDataProviderSymbol, provider(account));
}

export function useUserData(): Response {
  const defaultResponse = {} as Response;
  return inject(UserDataProviderSymbol, defaultResponse);
}
