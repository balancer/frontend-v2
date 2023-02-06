import { computed, provide } from 'vue';
import {
  PoolStakingProviderResponse,
  PoolStakingProviderSymbol,
} from '@/providers/local/pool-staking.provider';
import { mount, MountResult } from './mount-composable-tester';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
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
      provideFakePoolStaking();
      extraProviders?.();
    },
    configApp: app => registerTestPlugins(app),
  });
}
