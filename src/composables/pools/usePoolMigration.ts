import { RelayerAuthorization } from '@balancer-labs/sdk';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { POOL_MIGRATIONS } from '@/components/forms/pool_actions/MigrateForm/constants';
import { PoolMigrationType } from '@/components/forms/pool_actions/MigrateForm/types';
import { balancer } from '@/lib/balancer.sdk';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import { parseUnits } from 'ethers/lib/utils';
import useTime, { dateTimeLabelFor } from '../useTime';

export type MigratePoolState = {
  init: boolean;
  confirming: boolean;
  confirmed: boolean;
  confirmedAt: string;
  receipt?: TransactionReceipt;
};

export function usePoolMigration(
  stakedBptBalance: string,
  unstakedBptBalance: string,
  unstakedAmount = '0',
  isUnstakedMigrationEnabled: boolean,
  stakedAmount = '0',
  isStakedMigrationEnabled: boolean,
  fromPool: Pool,
  relayerApproval: Ref<boolean | undefined>
) {
  /**
   * COMPOSABLES
   */
  const { txListener, getTxConfirmedAt } = useEthers();
  const { addTransaction } = useTransactions();
  const { appNetworkConfig, account } = useWeb3();
  const { getSigner } = useWeb3();
  const vaultAddress = appNetworkConfig.addresses.vault;
  const { t } = useI18n();
  const { oneHourInMs } = useTime();

  /**
   * STATE
   */
  const migratePoolState = ref<MigratePoolState>({
    init: false,
    confirming: false,
    confirmed: false,
    confirmedAt: '',
  });
  const signature = ref('');
  const stakedAction = {
    label: t('migratePool.previewModal.actions.staked.title'),
    loadingLabel: t('migratePool.previewModal.actions.loading'),
    confirmingLabel: t('migratePool.confirming'),
    action: approveMigration.bind(
      null,
      true,
      scaleNum(stakedBptBalance, fromPool.onchain?.decimals)
    ),
    stepTooltip: t('migratePool.previewModal.actions.migrationStep'),
    isSignAction: false,
  };

  const unstakedAction = {
    label: t('migratePool.previewModal.actions.unstaked.title'),
    loadingLabel: t('migratePool.previewModal.actions.loading'),
    confirmingLabel: t('migratePool.confirming'),
    action: approveMigration.bind(
      null,
      false,
      scaleNum(unstakedBptBalance, fromPool.onchain?.decimals)
    ),
    stepTooltip: t('migratePool.previewModal.actions.migrationStep'),
    isSignAction: false,
  };

  const signAction = {
    label: t('migratePool.approve'),
    loadingLabel: t('checkWallet'),
    confirmingLabel: t('migratePool.approving'),
    stepTooltip: t('approveBatchRelayerTooltip'),
    action: getUserSignature as () => Promise<any>,
    isSignAction: true,
  };

  const actions = computed(() => {
    const arr: TransactionActionInfo[] = [];

    if (isStakedMigrationEnabled) arr.push(stakedAction);

    if (isUnstakedMigrationEnabled) {
      // the biggest one is migrated first
      Number(unstakedAmount) > Number(stakedAmount)
        ? arr.unshift(unstakedAction)
        : arr.push(unstakedAction);
    }

    if (!relayerApproval.value) arr.unshift(signAction);

    return arr;
  });

  const migrationType = computed(() => {
    return POOL_MIGRATIONS.find(
      migration => migration.fromPoolId === fromPool.id
    );
  });

  const migrationData = computed(() => {
    const signer = getSigner();
    const signerAddress = account.value;
    const _signature = relayerApproval.value ? undefined : signature.value;
    const _tokens = fromPool.tokens
      .filter(
        token => token.address.toLowerCase() !== fromPool.address.toLowerCase()
      )
      .map(token =>
        parseUnits(token.balance, fromPool.onchain?.decimals || 18).toString()
      );

    return {
      signer,
      signerAddress,
      _signature,
      _tokens,
    };
  });

  /**
   * METHODS
   */
  async function getUserSignature(): Promise<string> {
    try {
      const deadline = new Date().getTime() + oneHourInMs / 2;
      const vaultInstance = balancerContractsService.vault?.instance;
      const nonce = await vaultInstance.getNextNonce(account.value);
      const relayerAddress = configService.network.addresses.batchRelayer;
      const calldata = vaultInstance.interface.encodeFunctionData(
        'setRelayerApproval',
        [account.value, relayerAddress, true]
      );

      const _signature =
        await RelayerAuthorization.signSetRelayerApprovalAuthorization(
          vaultInstance,
          getSigner(),
          relayerAddress,
          calldata,
          deadline,
          nonce
        );

      const encodedSign = RelayerAuthorization.encodeCalldataAuthorization(
        '0x',
        deadline,
        _signature
      );

      signature.value = encodedSign;
      return signature.value;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function approveMigration(
    staked = true,
    amount: string
  ): Promise<TransactionResponse> {
    const { signer } = migrationData.value;

    let query;
    if (migrationType.value?.type === PoolMigrationType.AAVE_BOOSTED_POOL) {
      query = migrateBoostedPool(amount, staked, '0');
    }
    if (migrationType.value?.type === PoolMigrationType.STABAL3_POOL) {
      query = migrateStabal3(amount, staked);
    }

    const gasLimit = await signer.estimateGas({
      to: query.to,
      data: query.data,
    });

    const staticResult = await signer.call({
      to: query.to,
      data: query.data,
      gasLimit,
    });

    if (migrationType.value?.type === PoolMigrationType.AAVE_BOOSTED_POOL) {
      const expectedBpts = query.decode(staticResult, staked);
      query = migrateBoostedPool(amount, staked, expectedBpts.bbausd2AmountOut);
    }

    if (migrationType.value?.type === PoolMigrationType.STABAL3_POOL) {
      const bbausd2AmountOut = query.decode(staticResult, staked);

      query = migrateStabal3(amount, staked, bbausd2AmountOut);
    }

    const tx = await signer.sendTransaction({
      to: query.to,
      data: query.data,
      gasLimit,
    });

    handleTransaction(tx);

    return tx;
  }

  async function handleTransaction(tx: TransactionResponse): Promise<void> {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'approve',
      summary: t('transactionSummary.approveMigration'),
      details: {
        contractAddress: vaultAddress,
      },
    });

    migratePoolState.value.confirmed = await txListener(tx, {
      onTxConfirmed: async (receipt: TransactionReceipt) => {
        migratePoolState.value.confirming = false;
        migratePoolState.value.receipt = receipt;
        const confirmedAt = await getTxConfirmedAt(receipt);
        migratePoolState.value.confirmedAt = dateTimeLabelFor(confirmedAt);
      },
      onTxFailed: () => {
        migratePoolState.value.confirming = false;
      },
    });
  }

  function migrateBoostedPool(amount: string, staked: boolean, limit = '0') {
    const { signerAddress, _signature, _tokens } = migrationData.value;

    return balancer.zaps.migrations.bbaUsd(
      signerAddress,
      amount,
      limit,
      staked,
      _tokens,
      _signature
    );
  }

  function migrateStabal3(amount: string, staked: boolean, limit = '0') {
    const { signerAddress, _signature } = migrationData.value;

    return balancer.zaps.migrations.stabal3(
      signerAddress,
      amount,
      limit,
      staked,
      _signature
    );
  }

  function scaleNum(balance: string, decimals = 18): string {
    return parseUnits(balance, decimals).toString();
  }

  return { getUserSignature, approveMigration, actions, migratePoolState };
}
