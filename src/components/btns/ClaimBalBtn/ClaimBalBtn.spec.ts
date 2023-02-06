import { getAddress } from '@ethersproject/address';
import { fireEvent } from '@testing-library/vue';

import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import TxActionBtn from '@/components/btns/TxActionBtn/TxActionBtn.vue';
import { balancerMinter } from '@/services/balancer/contracts/contracts/balancer-minter';
import gauge from '@/services/balancer/gauges/__mocks__/decorated-gauge.schema.json';

import ClaimBalBtn from './ClaimBalBtn.vue';
import { renderComponent } from '@tests/renderComponent';

ClaimBalBtn.components = { TxActionBtn };
TxActionBtn.components = { BalBtn };

vi.mock('@/providers/tokens.provider');
vi.mock('@/composables/queries/useGaugesQuery');
vi.mock('@/composables/queries/useGaugesDecorationQuery');
vi.mock('@/services/balancer/contracts/contracts/balancer-minter');

const mockGaugeAddress = getAddress(gauge.id);

describe('ClaimBalBtn', () => {
  describe('When using ClaimBalBtn', () => {
    it('should render props', () => {
      const { getByText } = renderComponent(ClaimBalBtn, {
        props: {
          gauges: [gauge],
          label: 'Claim',
          amount: '1000',
        },
      });

      expect(getByText('Claim')).toBeVisible();
    });

    describe('Given 1 gauge', () => {
      it('Calls balancerMinter.mint on click', async () => {
        const { getByText } = renderComponent(ClaimBalBtn, {
          props: {
            gauges: [gauge],
            label: 'Claim',
            amount: '1000',
          },
        });

        const btn = getByText('Claim');

        await fireEvent.click(btn);

        expect(balancerMinter.mint).toBeCalledWith(mockGaugeAddress);
      });
    });

    describe('Given multiple gauges', () => {
      it('Calls balancerMinter.mintMany on click', async () => {
        const { getByText } = renderComponent(ClaimBalBtn, {
          props: {
            gauges: [gauge, gauge, gauge],
            label: 'Claim',
            amount: '1000',
          },
        });

        const btn = getByText('Claim');

        await fireEvent.click(btn);

        expect(balancerMinter.mintMany).toBeCalledWith([
          mockGaugeAddress,
          mockGaugeAddress,
          mockGaugeAddress,
        ]);
      });
    });
  });
});
