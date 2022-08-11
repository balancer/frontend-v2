import { AddressZero } from '@ethersproject/constants';
import { fireEvent, render } from '@testing-library/vue';

import { txResponseMock } from '@/__mocks__/transactions';
import BalBtn from '@/components/_global/BalBtn/BalBtn.vue';
import { FeeDistributor } from '@/services/balancer/contracts/contracts/fee-distributor';

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

const mockClaimBalance = jest.fn().mockResolvedValue(txResponseMock);
const mockClaimBalances = jest.fn().mockResolvedValue(txResponseMock);

describe.only('ClaimProtocolRewardsBtn', () => {
  beforeAll(() => {
    // @ts-ignore
    FeeDistributor.mockImplementation(() => {
      return {
        claimableTokens: [
          '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
          '0xba100000625a3754423978a60c9317c58a424e3D',
        ],
        claimBalance: mockClaimBalance,
        claimBalances: mockClaimBalances,
      };
    });
  });

  beforeEach(() => {
    // @ts-ignore
    FeeDistributor.mockClear();
  });

  it('should render props', () => {
    const { getByText } = render(ClaimProtocolRewardsBtn, {
      props: {
        fiatValue: '1000',
      },
    });

    expect(getByText('Claim all')).toBeVisible();
  });

  it('Calls FeeDistributor.claimBalances on click: Claim all', async () => {
    const { getByText } = render(ClaimProtocolRewardsBtn, {
      props: {
        fiatValue: '1000',
      },
    });

    const btn = getByText('Claim all');

    await fireEvent.click(btn);

    expect(mockClaimBalances).toBeCalled();
  });

  it('Calls FeeDistributor.claimBalance on click: Claim', async () => {
    const { getByText } = render(ClaimProtocolRewardsBtn, {
      props: {
        tokenAddress: '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2',
        fiatValue: '1000',
      },
    });

    const btn = getByText('Claim');

    await fireEvent.click(btn);

    // @ts-ignore
    expect(mockClaimBalance).toBeCalledWith(
      AddressZero,
      '0x7B50775383d3D6f0215A8F290f2C9e2eEBBEceb2'
    );
  });
});
