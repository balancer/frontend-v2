import { render, screen } from '@testing-library/vue';

import PoolPageHeader from './PoolPageHeader.vue';
import BalAlert from '@/components/_global/BalAlert/BalAlert.vue';
import BalStack from '@/components/_global/BalStack/BalStack.vue';
import BalLink from '@/components/_global/BalLink/BalLink.vue';
import BalIcon from '@/components/_global/BalIcon/BalIcon.vue';
import BalAsset from '@/components/_global/BalAsset/BalAsset.vue';

import samplePool from './__mocks__/sample-pool.json';
import sampleTitleTokens from './__mocks__/sample-title-tokens.json';

import i18n from '@/locales/default.json';

PoolPageHeader.components = {
  BalAlert,
  BalStack,
  BalLink,
  BalIcon,
  BalAsset,
};

// neede to prevent jest teleport error
jest.mock('@/components/contextual/stake/StakePreviewModal.vue', () => ({
  template: '<div>-</div>',
}));

jest.mock('@/locales');
jest.mock('@/composables/useNumbers');
jest.mock('@/composables/useTokens');
jest.mock('@/composables/useApp', () => {
  return jest.fn().mockImplementation(() => {
    return {
      appLoading: false,
    };
  });
});
jest.mock('@/composables/staking/useStaking', () => {
  return jest.fn().mockImplementation(() => {
    return {
      userData: {
        hasNonPrefGaugeBalances: false,
      },
    };
  });
});
jest.mock('@/services/web3/useWeb3', () => {
  return jest.fn().mockImplementation(() => {
    return {
      isWalletReady: new Proxy(
        {},
        {
          get() {
            return true;
          },
        }
      ),
      account: '0x0000000000000000000000000000000000000000',
    };
  });
});

describe('PoolPageHeader', () => {
  it('should not render weighted pool price provider warning', async () => {
    render(PoolPageHeader, {
      props: {
        loadingPool: true,
        loadingApr: true,
        noInitLiquidity: false,
        pool: {
          ...samplePool,
          id: '0x25accb7943fd73dda5e23ba6329085a3c24bfb6a000200000000000000000387',
          priceRateProviders: [
            {
              address: '0xd8143b8e7a6e452e5e1bc42a3cef43590a230031',
              token: {
                address: '0xd8143b8e7a6e452e5e1bc42a3cef43590a230031',
              },
            },
          ],
        },
        poolApr: undefined,
        isStableLikePool: false,
        titleTokens: sampleTitleTokens,
        missingPrices: false,
        isLiquidityBootstrappingPool: false,
        isComposableStableLikePool: false,
      },
    });
    const weightedPoolProvidersWarning = await screen.queryByText(
      i18n['hasNonApprovedRateProviders']
    );
    expect(weightedPoolProvidersWarning).not.toBeTruthy();
  });

  it('should render weighted pool price provider warning', async () => {
    render(PoolPageHeader, {
      props: {
        loadingPool: true,
        loadingApr: true,
        noInitLiquidity: false,
        pool: samplePool,
        poolApr: undefined,
        isStableLikePool: false,
        titleTokens: sampleTitleTokens,
        missingPrices: false,
        isLiquidityBootstrappingPool: false,
        isComposableStableLikePool: false,
      },
    });
    const weightedPoolProvidersWarning = await screen.findByText(
      i18n['hasNonApprovedRateProviders']
    );
    expect(weightedPoolProvidersWarning).toBeVisible();
  });
});
