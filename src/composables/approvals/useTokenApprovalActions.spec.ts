import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { initMulticallWithDefaultMocks } from '@/dependencies/multicall.mocks';
import { vaultAddress } from '@/services/contracts/vault.service.mocks';
import { mountComposableWithFakeTokensProvider } from '@tests/mount-helpers';
import { daiAddress } from '@tests/unit/builders/address';
import { ApprovalAction } from './types';

initMulticallWithDefaultMocks();

const amountsToApprove = [
  { address: daiAddress, amount: '3' },
  { address: '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE', amount: '6' },
];

async function mountUseTokenApprovalActions() {
  const { result } = await mountComposableWithFakeTokensProvider(() => {
    return useTokenApprovalActions();
  });

  return result;
}

test('Shows correct labels', async () => {
  const { getTokenApprovalActions } = await mountUseTokenApprovalActions();
  const actions = await getTokenApprovalActions({
    amountsToApprove,
    spender: vaultAddress,
    actionType: ApprovalAction.AddLiquidity,
  });
  expect(actions[0].label).toBe('Approve DAI for adding liquidity');
  expect(actions[1].label).toBe('Approve USDT for adding liquidity');
});

test('Gets approval actions for spender', async () => {
  const { getTokenApprovalActions } = await mountUseTokenApprovalActions();

  const actions = await getTokenApprovalActions({
    amountsToApprove,
    spender: vaultAddress,
    actionType: ApprovalAction.AddLiquidity,
  });
  expect(actions).toBeArray();
});
