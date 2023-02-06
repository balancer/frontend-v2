import {
  PoolStakingProviderResponse,
  PoolStakingProviderSymbol,
} from '@/providers/local/pool-staking.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import {
  tokensProvider,
  TokensProviderSymbol,
} from '@/providers/tokens.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { computed, provide, Ref } from 'vue';
import waitForExpect from 'wait-for-expect';
import { mount, MountResult } from './mount-composable-tester';
import { registerTestPlugins } from './registerTestPlugins';

export const defaultStakedShares = '5';

function provideFakePoolStaking() {
  provide(PoolStakingProviderSymbol, {
    stakedShares: computed(() => defaultStakedShares),
  } as PoolStakingProviderResponse);
}

export function mountComposable<R>(
  callback: () => R,
  extraProviders?: () => void
): MountResult<R> {
  return mount<R>(callback, {
    provider: () => {
      provideUserSettings();
      provideTokenLists();
      provide('store', {});
      provideFakePoolStaking();
      extraProviders?.();
    },
    configApp: app => registerTestPlugins(app),
  });
}

export function mountComposableWithDefaultTokensProvider<R>(
  callback: () => R
): MountResult<R> {
  return mountComposable<R>(callback, () => {
    const userSettings = provideUserSettings();
    const tokenLists = provideTokenLists();
    provide(TokensProviderSymbol, tokensProvider(userSettings, tokenLists));
  });
}

export async function waitForQueryData(result: {
  isLoading: Ref<boolean>;
  data: Ref<any>;
}) {
  expect(result.isLoading.value).toBeTrue();
  await waitForExpect(() => {
    expect(result.isLoading.value).toBeFalse();
  });
  return result.data.value;
}
