import { getAddress } from '@ethersproject/address';
import { fireEvent, render } from '@testing-library/vue';

import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import TxActionBtn from '@/components/btns/TxActionBtn/TxActionBtn.vue';
import { balancerMinter } from '@/services/balancer/contracts/contracts/balancer-minter';
import gauge from '@/services/balancer/gauges/__mocks__/decorated-gauge.schema.json';

import ClaimBalBtn from './ClaimBalBtn.vue';

ClaimBalBtn.components = { TxActionBtn };
TxActionBtn.components = { BalBtn };

jest.mock('@/composables/useTransactions');
jest.mock('@/composables/useTokens');
jest.mock('@/composables/useEthers');
jest.mock('@/composables/queries/useGaugesQuery');
jest.mock('@/composables/queries/useGaugesDecorationQuery');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/balancer/contracts/contracts/balancer-minter');

const mockGaugeAddress = getAddress(gauge.id);

describe.only('ClaimBalBtn', () => {
  describe('When using ClaimBalBtn', () => {
    it('should render props', () => {
      const { getByText } = render(ClaimBalBtn, {
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
        const { getByText } = render(ClaimBalBtn, {
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
        const { getByText } = render(ClaimBalBtn, {
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
