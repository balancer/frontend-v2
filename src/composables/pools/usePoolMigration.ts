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
import { TokenInfo } from '@/types/TokenList';
import { fiatValueOf } from '../usePool';
import useNumbers, { FNumFormats } from '../useNumbers';
import useSlippage from '../useSlippage';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { getGaugeAddress } from '@/providers/local/staking/staking.provider';

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
  toPool: Pool,
  fromPoolTokenInfo: TokenInfo,
  toPoolTokenInfo: TokenInfo,
  relayerApproval: Ref<boolean | undefined>,
  currentActionIndex: Ref<number>
) {
  /**
   * COMPOSABLES
   */
  const { txListener, getTxConfirmedAt } = useEthers();
  const { addTransaction } = useTransactions();
  const { account, getSigner } = useWeb3();
  const { t } = useI18n();
  const { oneHourInMs } = useTime();
  const { fNum2 } = useNumbers();
  const { minusSlippageScaled } = useSlippage();

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
    action: migrate.bind(
      null,
      parseUnits(stakedBptBalance, fromPool.onchain?.decimals).toString(),
      true
    ),
    stepTooltip: t('migratePool.previewModal.actions.migrationStep'),
    isSignAction: false,
    isStakeAction: true,
  };

  const unstakedAction = {
    label: t('migratePool.previewModal.actions.unstaked.title'),
    loadingLabel: t('migratePool.previewModal.actions.loading'),
    confirmingLabel: t('migratePool.confirming'),
    action: migrate.bind(
      null,
      parseUnits(unstakedBptBalance, fromPool.onchain?.decimals).toString(),
      false
    ),
    stepTooltip: t('migratePool.previewModal.actions.migrationStep'),
    isSignAction: false,
    isUnstakeAction: true,
  };

  const signAction = {
    label: t('migratePool.approve'),
    loadingLabel: t('checkWallet'),
    confirmingLabel: t('migratePool.approving'),
    stepTooltip: t('approveBatchRelayerTooltip'),
    action: getUserSignature as () => Promise<any>,
    isSignAction: true,
  };

  /**
   * COMPUTED
   */
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

  const migrationFn = computed(() => {
    switch (migrationType.value?.type) {
      case PoolMigrationType.AAVE_BOOSTED_POOL:
        return migrateBoostedPool;

      case PoolMigrationType.STABAL3_POOL:
        return migrateStabal3;

      case PoolMigrationType.STMATIC_POOL:
      case PoolMigrationType.XMATIC_POOL:
        return migrateStables;

      case PoolMigrationType.MAI_POOL:
        return migrateMaiUsd;

      default:
        return migrateBoostedPool;
    }
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

  const fromFiatTotal = computed((): string => {
    if (actions.value[currentActionIndex.value].isStakeAction) {
      return fiatValueOf(fromPool, stakedBptBalance);
    } else if (actions.value[currentActionIndex.value].isUnstakeAction) {
      return fiatValueOf(fromPool, unstakedBptBalance);
    } else {
      return '0';
    }
  });

  const fromFiatTotalLabel = computed((): string => {
    return fNum2(fromFiatTotal.value, FNumFormats.fiat);
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

  async function migrate(
    amount: string,
    isStaked: boolean
  ): Promise<TransactionResponse> {
    let query = await migrationFn.value(amount, isStaked, '0');

    const expectedBptOut = await getExpectedBptOut(amount, isStaked);
    const minBptOut = minusSlippageScaled(expectedBptOut);
    query = await migrationFn.value(amount, isStaked, minBptOut);

    const txBuilder = new TransactionBuilder(getSigner());
    const tx = await txBuilder.raw.sendTransaction({
      to: query.to,
      data: query.data,
    });

    handleTransaction(tx);
    return tx;
  }

  async function handleTransaction(tx: TransactionResponse): Promise<void> {
    addTransaction({
      id: tx.hash,
      type: 'tx',
      action: 'migratePool',
      summary: t('transactionSummary.migratePool', [
        fromFiatTotalLabel.value,
        fromPoolTokenInfo.symbol,
        toPoolTokenInfo.symbol,
      ]),
      details: {
        fromPool: fromPool,
        toPool: toPool,
        totalFiatPoolInvestment: fromFiatTotalLabel.value,
      },
    });

    const txResult = await txListener(tx, {
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

    if (currentActionIndex.value + 1 === actions.value.length) {
      migratePoolState.value.confirmed = txResult;
    }
  }

  async function getExpectedBptOut(
    bptIn: string,
    isStaked: boolean
  ): Promise<string> {
    const query = await migrationFn.value(bptIn, isStaked, '0');

    const txBuilder = new TransactionBuilder(getSigner());
    const staticResult = await txBuilder.raw.call({
      to: query.to,
      data: query.data,
    });

    return query.decode(staticResult, isStaked);
  }

  function migrateBoostedPool(bptIn: string, staked: boolean, minBptOut = '0') {
    const { signerAddress, _signature, _tokens } = migrationData.value;

    return balancer.zaps.migrations.bbaUsd(
      signerAddress,
      bptIn,
      minBptOut,
      staked,
      _tokens,
      _signature
    );
  }

  function migrateStabal3(bptIn: string, staked: boolean, minBptOut = '0') {
    const { signerAddress, _signature } = migrationData.value;

    return balancer.zaps.migrations.stabal3(
      signerAddress,
      bptIn,
      minBptOut,
      staked,
      _signature
    );
  }

  async function migrateStables(
    bptIn: string,
    staked: boolean,
    minBptOut = '0'
  ) {
    const { signerAddress, _signature } = migrationData.value;

    const fromData = {
      id: fromPool.id,
      address: fromPool.address,
    };

    const toData = {
      id: toPool.id,
      address: toPool.address,
    };

    if (staked) {
      const fromGaugeAddress = await getGaugeAddress(fromPool.address);
      const toGaugeAddress = await getGaugeAddress(toPool.address);
      fromData['gauge'] = fromGaugeAddress;
      toData['gauge'] = toGaugeAddress;
    }

    return balancer.zaps.migrations.stables(
      signerAddress,
      fromData,
      toData,
      bptIn,
      minBptOut,
      staked,
      [...fromPool.tokensList],
      _signature
    );
  }

  function migrateMaiUsd(bptIn: string, staked: boolean, minBptOut = '0') {
    const { signerAddress, _signature } = migrationData.value;

    return balancer.zaps.migrations.maiusd(
      signerAddress,
      bptIn,
      minBptOut,
      staked,
      _signature
    );
  }

  return {
    getUserSignature,
    migrate,
    actions,
    migratePoolState,
    getExpectedBptOut,
    fromFiatTotal,
  };
}
