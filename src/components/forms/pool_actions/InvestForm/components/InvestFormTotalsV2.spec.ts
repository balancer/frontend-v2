import { render, screen } from '@testing-library/vue';
import InvestFormTotalsV2 from './InvestFormTotalsV2.vue';

function getHighPriceImpactIcon() {
  return screen.queryByTestId('price-impact-warning-icon');
}

describe.skip('InvestFormTotalsV2.vue', () => {
  it('should show 0% price impact', () => {
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
    render(InvestFormTotalsV2, {
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
    render(InvestFormTotalsV2, {
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
