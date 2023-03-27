import useTokenApprovalActions from '@/composables/approvals/useTokenApprovalActions';
import { initMulticallWithDefaultMocks } from '@/dependencies/multicall.mocks';
import { mountComposableWithFakeTokensProvider } from '@tests/mount-helpers';
import { daiAddress, randomAddress } from '@tests/unit/builders/address';

initMulticallWithDefaultMocks();

async function mountUseTokenApprovalActions() {
  const { result } = await mountComposableWithFakeTokensProvider(() => {
    const addresses = [
      daiAddress,
      '0x1f1f156E0317167c11Aa412E3d1435ea29Dc3cCE', //Tether
    ];
    const amounts = ['3', '6'];
    return useTokenApprovalActions(ref(addresses), ref(amounts));
  });

  return result;
}

test('Shows correct labels', async () => {
  const { tokenApprovalActions } = await mountUseTokenApprovalActions();
  expect(tokenApprovalActions[0].label).toBe(
    'Approve DAI for adding liquidity'
  );
  expect(tokenApprovalActions[1].label).toBe(
    'Approve USDT for adding liquidity'
  );
});

const spender = randomAddress();

test('Gets approval actions for spender', async () => {
  const { getTokenApprovalActions } = await mountUseTokenApprovalActions();

  const actions = await getTokenApprovalActions();
  expect(actions).toBeArray();
});

test('Gets approval actions for spender', async () => {
  const { getTokenApprovalActionsForSpender } =
    await mountUseTokenApprovalActions();

  const actions = await getTokenApprovalActionsForSpender(spender, '1');
  expect(actions).toBeArray();
});

test('Fetches Token Approval actions', async () => {
  const { fetchTokenApprovalActions } = await mountUseTokenApprovalActions();

  const actions = await fetchTokenApprovalActions(spender);
  expect(actions).toBeArray();
});
