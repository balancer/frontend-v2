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
import { provideUserData } from '@/providers/user-data.provider';
import { initOldMulticallerWithDefaultMocks } from '@/dependencies/OldMulticaller.mocks';

export const defaultStakedShares = '5';

initOldMulticallerWithDefaultMocks();

export function provideFakePoolStaking(stackedShares = defaultStakedShares) {
  provide(PoolStakingProviderSymbol, {
    stakedShares: computed(() => stackedShares),
  } as PoolStakingProviderResponse);
}

export function mountComposable<R>(
  callback: () => R,
  options?: {
    extraProvidersCb?: () => void;
    intermediateProvider?: () => void;
    routerMock?: Router;
  }
): MountResult<R> {
  return mount<R>(callback, {
    provider: () => {
      provideWallets();
      provideUserData();
      provideUserSettings();
      provideTokenLists();
      provideFakePoolStaking();
      options?.extraProvidersCb?.();
    },
    intermediateProvider: options?.intermediateProvider,
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

// Used when fakeTokens is used by another provider that it is also depending on tokens provider (For instance, joinPoolProvider)
export let fakeTokens;

export function provideFakeTokens(
  tokensProviderOverride?: DeepPartial<TokensResponse>
) {
  const tokenLists = provideTokenLists();
  const userSettings = provideUserSettings();
  const tokens = fakeTokensProvider(
    userSettings,
    tokenLists,
    tokensProviderOverride
  );
  provide(TokensProviderSymbol, tokens);
  return tokens;
}

export async function mountComposableWithFakeTokensProvider<R>(
  callback: () => R,
  options?: {
    extraProvidersCb?: () => void;
    intermediateProvider?: () => void;
    tokensProviderOverride?: DeepPartial<TokensResponse>;
    routerMock?: Router;
  }
): Promise<MountResult<R>> {
  return mountComposable<R>(callback, {
    extraProvidersCb: () => {
      fakeTokens = provideFakeTokens(options?.tokensProviderOverride);
      options?.extraProvidersCb?.();
    },
    intermediateProvider: options?.intermediateProvider,
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

export async function waitForQueryLoaded(result: { isLoading: Ref<boolean> }) {
  expect(result.isLoading.value).toBeTrue();
  await waitForExpect(() => {
    expect(result.isLoading.value).toBeFalse();
  });
  return result;
}
