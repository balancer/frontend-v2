import { screen } from '@testing-library/vue';

import PoolPageHeader from './PoolPageHeader.vue';
import samplePool from './__mocks__/sample-pool.json';
import sampleTitleTokens from './__mocks__/sample-title-tokens.json';

import { renderComponent } from '@tests/renderComponent';

vi.mock('@/providers/tokens.provider');
vi.mock('@/services/web3/useWeb3');

describe('PoolPageHeader', () => {
  it('should not render weighted pool price provider warning', async () => {
    renderComponent(PoolPageHeader, {
      global: {
        stubs: {
          // needed to prevent teleport error
          StakePreviewModal: true,
        },
      },
      props: {
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
    const weightedPoolProvidersWarning = screen.queryByText(
      'One or more token rate providers associated with tokens in this pool have not been vetted. Investing has been disabled.'
    );
    expect(weightedPoolProvidersWarning).not.toBeTruthy();
  });

  it('should render weighted pool price provider warning', async () => {
    renderComponent(PoolPageHeader, {
      global: {
        stubs: {
          StakePreviewModal: true,
        },
      },
      props: {
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
      'One or more token rate providers associated with tokens in this pool have not been vetted. Investing has been disabled.'
    );
    expect(weightedPoolProvidersWarning).toBeVisible();
  });
});
