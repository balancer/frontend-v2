import { AddressZero } from '@ethersproject/constants';
import { fireEvent, render } from '@testing-library/vue';

import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import { feeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';

import ClaimProtocolRewardsBtn from './ClaimProtocolRewardsBtn.vue';
import TxActionBtn from './TxActionBtn/TxActionBtn.vue';

ClaimProtocolRewardsBtn.components = { TxActionBtn };
TxActionBtn.components = { BalBtn };

jest.mock('@/services/balancer/contracts/contracts/fee-distributor');
jest.mock('@/composables/useTransactions');
jest.mock('@/composables/useTokens');
jest.mock('@/composables/useEthers');
jest.mock('@/composables/useNumbers');
jest.mock('@/composables/queries/useProtocolRewardsQuery');
jest.mock('@/services/web3/useWeb3');
jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('vue-i18n');

describe.only('ClaimProtocolRewardsBtn', () => {
  it('should render props', () => {
    const { getByText } = render(ClaimProtocolRewardsBtn, {
      props: {
        fiatValue: '1000'
      }
    });

    expect(getByText('Claim all')).toBeVisible();
  });

  it('Calls FeeDistributor.claimBalances on click: Claim all', async () => {
    const { getByText } = render(ClaimProtocolRewardsBtn, {
      props: {
        fiatValue: '1000'
      }
    });

    const btn = getByText('Claim all');

    await fireEvent.click(btn);

    expect(feeDistributor.claimBalances).toBeCalled();
  });

  it('Calls FeeDistributor.claimBalance on click: Claim', async () => {
    const { getByText } = render(ClaimProtocolRewardsBtn, {
      props: {
        tokenAddress: feeDistributor.claimableTokens[0],
        fiatValue: '1000'
      }
    });

    const btn = getByText('Claim');

    await fireEvent.click(btn);

    expect(feeDistributor.claimBalance).toBeCalledWith(
      AddressZero,
      feeDistributor.claimableTokens[0]
    );
  });
});
