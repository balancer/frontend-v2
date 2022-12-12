import {
  AppProvider,
  TokenListProvider,
  TokensProvider,
  UserSettingsProvider,
} from '@/providers';
import { render, screen } from '@testing-library/vue';
import InvestFormTotalsV2 from './InvestFormTotalsV2.vue';
import { h } from 'vue';
import Web3Plugin from '@/services/web3/web3.plugin';

import blocknative from '@/plugins/blocknative';
import { QueryClient, VUE_QUERY_CLIENT } from 'vue-query';

jest.mock('@ethersproject/providers');
jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/lib/balancer.sdk.ts', () => {
  return {
    network: 5,
  };
});

function getHighPriceImpactIcon() {
  return screen.queryByTestId('price-impact-warning-icon');
}

describe.skip('InvestFormTotalsV2.vue', () => {
  it('should show 0% price impact', () => {
    const queryClient = new QueryClient();
    queryClient.mount();

    render(InvestFormTotalsV2, {
      props: {
        highPriceImpact: false,
        loading: false,
        priceImpact: 0.0,
      },
    });
    expect(screen.getByText('0.00%')).toBeInTheDocument();
    expect(getHighPriceImpactIcon()).not.toBeInTheDocument();
  });
  it('should show 0.10% price impact', () => {
    const queryClient = new QueryClient();
    queryClient.mount();

    render(UserSettingsProvider, {
      slots: {
        default() {
          return h(
            TokenListProvider,
            {},
            {
              default() {
                return h(
                  TokensProvider,
                  {},
                  {
                    default() {
                      return h(
                        AppProvider,
                        {},
                        {
                          default() {
                            return h(InvestFormTotalsV2, {
                              highPriceImpact: false,
                              loading: false,
                              priceImpact: 0.001,
                            });
                          },
                        }
                      );
                    },
                  }
                );
              },
            }
          );
        },
      },
      props: {},
      global: {
        components: {},
        plugins: [Web3Plugin, blocknative],
        provide: {
          [VUE_QUERY_CLIENT]: queryClient,
          // [bnSdkSymbol]: blocknative,
          // [UserSettingsProviderSymbol]: useUserSettings,
        },
      },
    });
    expect(screen.getByText('0.10%')).toBeInTheDocument();
    expect(getHighPriceImpactIcon()).not.toBeInTheDocument();
  });
  it('should show high price impact warning icon', () => {
    const queryClient = new QueryClient();
    queryClient.mount();

    render(UserSettingsProvider, {
      slots: {
        default() {
          return h(
            TokenListProvider,
            {},
            {
              default() {
                return h(
                  TokensProvider,
                  {},
                  {
                    default() {
                      return h(
                        AppProvider,
                        {},
                        {
                          default() {
                            return h(InvestFormTotalsV2, {
                              highPriceImpact: true,
                              loading: false,
                              priceImpact: 0.001,
                            });
                          },
                        }
                      );
                    },
                  }
                );
              },
            }
          );
        },
      },
      props: {},
      global: {
        components: {},
        plugins: [Web3Plugin, blocknative],
        provide: {
          [VUE_QUERY_CLIENT]: queryClient,
          // [bnSdkSymbol]: blocknative,
          // [UserSettingsProviderSymbol]: useUserSettings,
        },
      },
    });
    expect(screen.getByText('0.10%')).toBeInTheDocument();
    expect(getHighPriceImpactIcon()).toBeInTheDocument();
  });
});
