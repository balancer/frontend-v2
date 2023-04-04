import {
  PoolStakingProviderResponse,
  PoolStakingProviderSymbol,
} from '@/providers/local/pool-staking.provider';
import { provideTokenLists } from '@/providers/token-lists.provider';
import {
  tokensProvider,
  TokensProviderSymbol,
  TokensResponse,
} from '@/providers/tokens.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { provideWallets } from '@/providers/wallet.provider';
import { fakeTokensProvider } from '@/providers/__mocks__/tokens.provider.fake';
import { computed, provide, Ref } from 'vue';
import waitForExpect from 'wait-for-expect';
import { mount, MountResult } from './mount-composable-tester';
import { registerTestPlugins } from './registerTestPlugins';
import { DeepPartial } from './unit/types';
import { Router } from 'vue-router';

export const defaultStakedShares = '5';

export function provideFakePoolStaking(stackedShares = defaultStakedShares) {
  provide(PoolStakingProviderSymbol, {
    stakedShares: computed(() => stackedShares),
  } as PoolStakingProviderResponse);
}

export function mountComposable<R>(
  callback: () => R,
  options?: { extraProvidersCb?: () => void; routerMock?: Router }
): MountResult<R> {
  return mount<R>(callback, {
    provider: () => {
      provideWallets();
      provideUserSettings();
      provideTokenLists();
      provide('store', {});
      provideFakePoolStaking();
      options?.extraProvidersCb?.();
    },
    configApp: app => {
      if (options?.routerMock) app.use(options.routerMock);

      return registerTestPlugins(app);
    },
  });
}

export function mountComposableWithDefaultTokensProvider<R>(
  callback: () => R,
  options?: { extraProvidersCb?: () => void }
): MountResult<R> {
  return mountComposable<R>(callback, {
    extraProvidersCb: () => {
      const userSettings = provideUserSettings();
      const tokenLists = provideTokenLists();
      provide(TokensProviderSymbol, tokensProvider(userSettings, tokenLists));
      options?.extraProvidersCb?.();
    },
  });
}

export async function mountComposableWithFakeTokensProvider<R>(
  callback: () => R,
  options?: {
    extraProvidersCb?: () => void;
    tokensProviderOverride?: DeepPartial<TokensResponse>;
    routerMock?: Router;
  }
): Promise<MountResult<R>> {
  return mountComposable<R>(callback, {
    extraProvidersCb: () => {
      const tokenLists = provideTokenLists();
      const userSettings = provideUserSettings();
      provide(
        TokensProviderSymbol,
        fakeTokensProvider(
          userSettings,
          tokenLists,
          options?.tokensProviderOverride
        )
      );
      options?.extraProvidersCb?.();
    },
    routerMock: options?.routerMock,
  });
}

export async function waitForQueryData<T>(result: {
  isLoading: Ref<boolean>;
  data: Ref<T>;
}) {
  expect(result.isLoading.value).toBeTrue();
  await waitForExpect(() => {
    expect(result.isLoading.value).toBeFalse();
  });
  return result.data.value;
}
