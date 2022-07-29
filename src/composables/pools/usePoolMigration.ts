import { RelayerAuthorization } from '@balancer-labs/sdk';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { parseFixed } from '@ethersproject/bignumber';
import { computed, Ref, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { balancer } from '@/lib/balancer.sdk';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { configService } from '@/services/config/config.service';
import { PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';
import { TransactionActionInfo } from '@/types/transactions';

import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import useUserSettings from '../useUserSettings';

const HALF_HOUR = 30 * 60 * 1000;
const MAX_GAS_LIMIT = 8e6;

export function usePoolMigration(
  amount: string,
  tokens: PoolToken[],
  relayerApproval: Ref<boolean | undefined>
) {
  /**
   * COMPOSABLES
   */
  const { txListener } = useEthers();
  const { addTransaction } = useTransactions();
  const { appNetworkConfig, account } = useWeb3();
  const { getSigner } = useWeb3();
  const vaultAddress = appNetworkConfig.addresses.vault;
  const { t } = useI18n();
  const { slippage } = useUserSettings();

  /**
   * STATE
   */
  const signature = ref('');

  /**
   * COMPUTED
   */
  const actions = computed(() => {
    const arr: TransactionActionInfo[] = [
      {
        label: t('migratePool.previewModal.actions.title'),
        loadingLabel: t('migratePool.previewModal.actions.loading'),
        confirmingLabel: t('confirming'),
        action: approveMigration,
        stepTooltip: t('migratePool.previewModal.actions.migrationStep'),
        isSignAction: false
      }
    ];

    if (!relayerApproval.value) {
      arr.unshift({
        label: t('approveBatchRelayer'),
        loadingLabel: t('checkWallet'),
        confirmingLabel: t('approvingBatchRelayer'),
        stepTooltip: t('approveBatchRelayerTooltip'),
        action: getUserSignature as () => Promise<any>,
        isSignAction: true
      });
    }
    return arr;
  });
  /**
   * METHODS
   */
  async function getUserSignature(): Promise<string> {
    try {
      const deadline = new Date().getTime() + HALF_HOUR;
      const vaultInstance = balancerContractsService.vault?.instance;
      const nonce = await vaultInstance.getNextNonce(account.value);
      const relayerAddress = configService.network.addresses.batchRelayer;
      const calldata = vaultInstance.interface.encodeFunctionData(
        'setRelayerApproval',
        [account.value, relayerAddress, true]
      );

      const _signature = await RelayerAuthorization.signSetRelayerApprovalAuthorization(
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

  async function approveMigration(): Promise<TransactionResponse> {
    const signer = getSigner();
    const signerAddress = account.value;
    const staked = false;
    const gasLimit = MAX_GAS_LIMIT;
    const _signature = relayerApproval.value ? undefined : signature.value;
    const _tokens: any[] = tokens
      .filter(token => token.symbol !== 'bb-a-USD')
      .map(token => parseFixed(token.balance, 18).toString());

    console.log('_tije', _tokens);
    console.log('signature,', signature.value);
    let query = balancer.zaps.migrations.bbaUsd(
      signerAddress,
      amount,
      '0',
      staked,
      _tokens,
      _signature
    );
    console.log('query', query);
    const staticResult = await signer.call({
      to: query.to,
      data: query.data,
      gasLimit
    });
    console.log('staticResult', staticResult);
    const expectedBpts = query.decode(staticResult, staked);
    console.log('expectedBpts', expectedBpts);
    query = balancer.zaps.migrations.bbaUsd(
      signerAddress,
      amount.toString(),
      expectedBpts.bbausd2AmountOut,
      staked,
      _tokens,
      _signature
    );
    console.log('approve', query);

    const transaction = await signer.sendTransaction({
      to: query.to,
      data: query.data,
      gasLimit
    });
    console.log('transaction', transaction);
    return transaction;
  }

  return { getUserSignature, approveMigration, actions };
}
