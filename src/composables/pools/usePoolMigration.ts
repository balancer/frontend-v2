import { RelayerAuthorization } from '@balancer-labs/sdk';
import {
  TransactionReceipt,
  TransactionResponse,
} from '@ethersproject/abstract-provider';
import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { getBalancer } from '@/dependencies/balancer-sdk';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { configService } from '@/services/config/config.service';
import { Pool } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import { parseUnits } from '@ethersproject/units';
import useTime, { dateTimeLabelFor } from '../useTime';
import { TokenInfo } from '@/types/TokenList';
import { fiatValueOf, tokensListExclBpt } from '../usePool';
import useNumbers, { FNumFormats } from '../useNumbers';
import useSlippage from '../useSlippage';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';
import { usePoolStaking } from '@/providers/local/pool-staking.provider';

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
  const balancer = getBalancer();
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
  const { fetchPreferentialGaugeAddress } = usePoolStaking();

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

  function migrateBoostedPool(bptIn: string, staked: boolean, minBptOut = '0') {
    const { signerAddress, _signature, _tokens } = migrationData.value;

    return getBalancer().zaps.migrations.bbaUsd(
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

    return getBalancer().zaps.migrations.stabal3(
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
      const [fromGaugeAddress, toGaugeAddress] = await Promise.all([
        fetchPreferentialGaugeAddress(fromPool.address),
        fetchPreferentialGaugeAddress(toPool.address),
      ]);
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
      [...tokensListExclBpt(fromPool)],
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
    actions,
    migratePoolState,
    fromFiatTotal,
  };
}
