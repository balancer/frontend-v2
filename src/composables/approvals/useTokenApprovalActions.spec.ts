import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { vaultAddress } from '@/services/contracts/vault.service.mocks';
import { mountComposableWithFakeTokensProvider } from '@tests/mount-helpers';
import { daiAddress } from '@tests/unit/builders/address';
import { ApprovalAction } from './types';

initDependenciesWithDefaultMocks();

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

test.skip('Asks for approval twice for tokens that require double approval with an already approved amount', async () => {
  const { getTokenApprovalActions } = await mountUseTokenApprovalActions();

  const actions = await getTokenApprovalActions({
    amountsToApprove,
    spender: vaultAddress,
    actionType: ApprovalAction.AddLiquidity,
  });
  expect(actions.length).toBe(2);
  // The first action should not re-validate as it's setting the token amount to 0
  expect(actions[0].postActionValidation).toBeUndefined();
  // The second action should validate as it's checking the approved amount is correct
  expect(actions[1].postActionValidation).toBeDefined();
});

test.skip('Asks for approval once for tokens that require double approval without an already approved amount', async () => {
  const { getTokenApprovalActions } = await mountUseTokenApprovalActions();

  const actions = await getTokenApprovalActions({
    amountsToApprove,
    spender: vaultAddress,
    actionType: ApprovalAction.AddLiquidity,
  });
  expect(actions.length).toBe(2);
  // The first action should not re-validate as it's setting the token amount to 0
  expect(actions[0].postActionValidation).toBeUndefined();
  // The second action should validate as it's checking the approved amount is correct
  expect(actions[1].postActionValidation).toBeDefined();
});
