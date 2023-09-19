import {
  PoolStakingProviderResponse,
  PoolStakingProviderSymbol,
} from '@/providers/local/pool-staking.provider';
import {
  tokenListsProvider,
  TokenListsProviderSymbol,
} from '@/providers/token-lists.provider';
import { wallets, WalletsProviderSymbol } from '@/providers/wallet.provider';
import { render, RenderOptions } from '@testing-library/vue';
import { RouterLinkStub } from '@vue/test-utils';
import { mergeWith } from 'lodash';
import { Plugin, computed } from 'vue';
import { registerTestPlugins } from './registerTestPlugins';

const DefaultTestPlugins = {
  install(app) {
    registerTestPlugins(app);
    app.provide(TokenListsProviderSymbol, tokenListsProvider());
    app.provide(WalletsProviderSymbol, wallets());
    app.provide(PoolStakingProviderSymbol, {
      stakedShares: computed(() => '1000'),
    } as PoolStakingProviderResponse);
  },
};

export function renderComponent(
  componentUnderTest,
  options: RenderOptions = {},
  extraPlugins?: Plugin
) {
  const defaultOptions: Partial<RenderOptions> = {
    global: {
      plugins: extraPlugins
        ? [DefaultTestPlugins, extraPlugins]
        : [DefaultTestPlugins],
      stubs: {
        RouterLink: RouterLinkStub,
        Jazzicon: true,
        BalIcon: true,
        LightBulbIcon: true,
      },
    },
  };

  const mergedOptions = mergeWith(defaultOptions, options, mergeCustomizer);

  return render(componentUnderTest, mergedOptions);
}

function mergeCustomizer(objValue: unknown, srcValue: unknown) {
  if (Array.isArray(objValue)) {
    return objValue.concat(srcValue);
  }
}
