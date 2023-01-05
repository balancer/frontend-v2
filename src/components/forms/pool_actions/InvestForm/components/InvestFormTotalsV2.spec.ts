import { screen } from '@testing-library/vue';
import InvestFormTotalsV2 from './InvestFormTotalsV2.vue';

import { Multicaller } from '@/lib/utils/balancer/contract';
import renderComponent from '@/tests/renderComponent';

jest.mock('@ethersproject/providers');
// jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/lib/balancer.sdk.ts', () => {
  return {
    network: 5,
  };
});

// Mocking injecting veBAL token metadata
jest.mock('@/lib/utils/balancer/contract');
// @ts-expect-error
Multicaller.mockImplementation(() => {
  return {
    call: jest.fn(),
    execute: jest.fn().mockResolvedValue({
      '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF': {
        address: '0x33A99Dcc4C85C014cf12626959111D5898bbCAbF',
        chainId: 5,
        decimals: 18,
        logoURI:
          'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0x33A99Dcc4C85C014cf12626959111D5898bbCAbF/logo.png',
        name: 'Vote Escrowed Balancer BPT',
        symbol: 'veBAL',
      },
    }),
  };
});

function getHighPriceImpactIcon() {
  return screen.queryByTestId('price-impact-warning-icon');
}

describe('InvestFormTotalsV2.vue', () => {
  it('should show 0% price impact', () => {
    renderComponent(InvestFormTotalsV2, {
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
    renderComponent(InvestFormTotalsV2, {
      props: {
        highPriceImpact: false,
        loading: false,
        priceImpact: 0.001,
      },
    });

    expect(screen.getByText('0.10%')).toBeInTheDocument();
    expect(getHighPriceImpactIcon()).not.toBeInTheDocument();
  });
  it('should show high price impact warning icon', () => {
    renderComponent(InvestFormTotalsV2, {
      props: {
        highPriceImpact: true,
        loading: false,
        priceImpact: 0.001,
      },
    });
    expect(screen.getByText('0.10%')).toBeInTheDocument();
    expect(getHighPriceImpactIcon()).toBeInTheDocument();
  });
});
