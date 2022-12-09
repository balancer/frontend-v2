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
vi.mock('@/components/contextual/stake/StakePreviewModal.vue', () => ({
  default: {
    template: '<div>-</div>',
  },
}));

vi.mock('@/locales');
vi.mock('@/composables/useNumbers');
vi.mock('@/composables/useTokens');
vi.mock('@/composables/useApp', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        appLoading: false,
      };
    }),
  };
});
vi.mock('@/composables/staking/useStaking', () => {
  return {
    default: vi.fn().mockImplementation(() => {
      return {
        userData: {
          hasNonPrefGaugeBalances: false,
        },
      };
    }),
  };
});
vi.mock('@/services/web3/useWeb3');

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
