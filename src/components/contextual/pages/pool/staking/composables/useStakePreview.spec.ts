import {
  aWeightedPool,
  defaultWeightedPoolSymbol,
} from '@/__mocks__/weighted-pool';
import { addTransactionMock } from '@/composables/__mocks__/useTransactions';
import { defaultContractTransactionResponse } from '@/dependencies/contract.concern.mocks';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { sleep } from '@/lib/utils';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { provideUserData } from '@/providers/user-data.provider';
import { mockWhenUserHasSharesInANonPreferentialGauge } from '@/services/balancer/gauges/__mocks__/gauge-mocks';
import { walletProviderMock } from '@/services/contracts/vault.service.mocks';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { firstCallParams } from '@tests/vitest/assertions';
import {
  StakeAction,
  StakePreviewProps,
  useStakePreview,
} from './useStakePreview';
import { TransactionReceipt } from '@ethersproject/abstract-provider';

initDependenciesWithDefaultMocks();
walletServiceInstance.setUserProvider(computed(() => walletProviderMock));

const emit = vi.fn();

const pool = aWeightedPool();

function buildProps() {
  const props: StakePreviewProps = reactive({
    pool,
    action: 'stake',
  });
  async function changeStakeActionProp(action: StakeAction) {
    props.action = action;
    // Wait for watcher to change actions and for stake staking provider to be finished
    await sleep(10);
  }
  return { props, loadStakeAction: changeStakeActionProp };
}

async function mountUseStakePreview(props: StakePreviewProps) {
  const { result } = await mountComposable(() => useStakePreview(props, emit), {
    intermediateProvider: () => {
      providePoolStaking(pool.id);
    },
    extraProvidersCb: () => provideUserData(),
  });
  return result;
}

describe.skip('UseStake preview', () => {
  test('Successfully creates and runs stake action', async () => {
    const { props, loadStakeAction } = buildProps();

    const { stakeActions } = await mountUseStakePreview(props);

    await loadStakeAction('stake');

    const approvalAction = stakeActions.value[0];
    expect(approvalAction).toMatchObject({
      confirmingLabel: 'Confirming...',
      label: `Approve ${defaultWeightedPoolSymbol} for staking`,
      loadingLabel: 'Confirm approval in wallet',
      stepTooltip: `You must approve ${defaultWeightedPoolSymbol} to stake this token on Balancer. Approvals are required once per token, per wallet.`,
    });

    const stakeAction = stakeActions.value[1];
    expect(stakeAction).toMatchObject({
      confirmingLabel: 'Confirming...',
      label: 'Stake',
      loadingLabel: 'Staking',
      stepTooltip:
        'Confirm staking of LP tokens to earn liquidity mining incentives on this pool',
    });

    // Stake action implementation is deeply tested in pool staking provider tests
    const stakeTransactionResult = await stakeAction.action();
    expect(stakeTransactionResult).toEqual(defaultContractTransactionResponse);

    //Saves transaction
    expect(addTransactionMock).toHaveBeenCalledOnce();
    const params = firstCallParams(addTransactionMock);
    expect(params.action).toBe('stake');
    expect(params.details?.pool).toEqual(pool);
  });

  test('Successfully creates and runs unstake action', async () => {
    const { props, loadStakeAction } = buildProps();

    const { stakeActions } = await mountUseStakePreview(props);

    await loadStakeAction('unstake');

    expect(stakeActions.value).toHaveLength(1);

    const unstakeAction = stakeActions.value[0];
    expect(unstakeAction).toMatchObject({
      confirmingLabel: 'Confirming...',
      label: 'Unstake',
      loadingLabel: 'Unstaking',
      stepTooltip:
        "Confirm unstaking of LP tokens. You'll lose eligibility to earn liquidity mining incentives for this pool.",
    });

    // Unstake action implementation is deeply tested in pool staking provider tests
    const stakeTransactionResult = await unstakeAction.action();
    expect(stakeTransactionResult).toEqual(defaultContractTransactionResponse);

    //Saves transaction
    expect(addTransactionMock).toHaveBeenCalledOnce();
    const params = firstCallParams(addTransactionMock);
    expect(params.action).toBe('unstake');
    expect(params.details?.pool).toEqual(pool);
  });

  test('Successfully creates and runs restake action (unstake + stake)', async () => {
    mockWhenUserHasSharesInANonPreferentialGauge();

    const { props, loadStakeAction } = buildProps();

    const { stakeActions } = await mountUseStakePreview(props);

    await loadStakeAction('restake');

    expect(stakeActions.value).toHaveLength(3);

    const approvalAction = stakeActions.value[0];
    expect(approvalAction).toMatchObject({
      confirmingLabel: 'Confirming...',
      label: `Approve ${defaultWeightedPoolSymbol} for staking`,
      loadingLabel: 'Confirm approval in wallet',
      stepTooltip: `You must approve ${defaultWeightedPoolSymbol} to stake this token on Balancer. Approvals are required once per token, per wallet.`,
    });

    const unstakeAction = stakeActions.value[1];

    expect(unstakeAction).toMatchObject({
      confirmingLabel: 'Confirming...',
      label: 'Unstake',
      loadingLabel: 'Unstaking',
      stepTooltip:
        "Confirm unstaking of LP tokens. You'll lose eligibility to earn liquidity mining incentives for this pool.",
    });

    const stakeAction = stakeActions.value[2];
    expect(stakeAction).toMatchObject({
      confirmingLabel: 'Confirming...',
      label: 'Stake',
      loadingLabel: 'Staking',
      stepTooltip:
        'Confirm staking of LP tokens to earn liquidity mining incentives on this pool',
    });
  });

  test('Changes staking actions when action prop changes', async () => {
    const { props, loadStakeAction } = buildProps();
    const { stakeActions } = await mountUseStakePreview(props);

    await loadStakeAction('stake');

    expect(stakeActions.value).toHaveLength(2);

    expect(stakeActions.value[0].label).toEqual(
      `Approve ${defaultWeightedPoolSymbol} for staking`
    );
    expect(stakeActions.value[1].label).toEqual('Stake');

    await loadStakeAction('unstake');

    expect(stakeActions.value).toHaveLength(1);
    expect(stakeActions.value[0].label).toEqual('Unstake');

    await loadStakeAction('restake');

    expect(stakeActions.value).toHaveLength(2);
    expect(stakeActions.value[0].label).toEqual('Unstake');
    expect(stakeActions.value[1].label).toEqual('Stake');
  });

  test('Handles staking action success', async () => {
    const { props } = buildProps();
    const { handleSuccess, isActionConfirmed } = await mountUseStakePreview(
      props
    );

    expect(isActionConfirmed.value).toBeFalse();

    await handleSuccess({} as TransactionReceipt);

    expect(isActionConfirmed.value).toBeTrue();
    expect(emit).toHaveBeenCalledOnceWith('success');
  });

  test('Handles staking close', async () => {
    const { props } = buildProps();

    const { handleClose, isActionConfirmed } = await mountUseStakePreview(
      props
    );

    expect(isActionConfirmed.value).toBeFalse();

    handleClose();

    expect(isActionConfirmed.value).toBeFalse();
    expect(emit).toHaveBeenCalledOnceWith('close');
  });
});
