import { BigNumber } from '@ethersproject/bignumber';
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { balancer } from '@/lib/balancer.sdk';
import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { configService } from '@/services/config/config.service';
import { PoolToken } from '@/services/pool/types';
import useWeb3 from '@/services/web3/useWeb3';

import useEthers from '../useEthers';
import useTransactions from '../useTransactions';
import useUserSettings from '../useUserSettings';

const HALF_HOUR = 30 * 60 * 1000;

export function usePoolMigration(amount: string, tokens: PoolToken[]) {
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

  const actions = [
    {
      label: t('approveBatchRelayer'),
      loadingLabel: t('checkWallet'),
      confirmingLabel: t('approvingBatchRelayer'),
      stepTooltip: t('approveBatchRelayerTooltip'),
      action: getUserSignature,
      isSignAction: true
    },
    {
      label: t('migratePool.previewModal.actions.title'),
      loadingLabel: t('migratePool.previewModal.actions.loading'),
      confirmingLabel: t('confirming'),
      action: approveMigration,
      stepTooltip: t('migratePool.previewModal.actions.migrationStep')
    }
  ];

  /**
   * COMPUTED
   */

  /**
   * METHODS
   */
  async function getUserSignature(): Promise<string> {
    try {
      const domain = {
        name: 'Balancer V2 Vault',
        version: '1',
        chainId: configService.network.chainId,
        verifyingContract: vaultAddress
      };

      const types = {
        SetRelayerApproval: [
          { name: 'calldata', type: 'bytes' },
          { name: 'sender', type: 'address' },
          { name: 'nonce', type: 'uint256' },
          { name: 'deadline', type: 'uint256' }
        ]
      };

      const relayerAddress = configService.network.addresses.batchRelayer;
      const vaultInstance = balancerContractsService.vault?.instance;
      const nonce = await vaultInstance.getNextNonce(account.value);
      const calldata = vaultInstance.interface.encodeFunctionData(
        'setRelayerApproval',
        [account.value, relayerAddress, true]
      );

      console.log('nonce', nonce);

      const values = {
        calldata,
        nonce,
        sender: relayerAddress,
        deadline: new Date().getTime() + HALF_HOUR
      };

      console.log('values', values);

      const signer = getSigner();
      signature.value = await signer._signTypedData(domain, types, values);
      console.log('signature', signature);

      await txListener(signature as any, {
        onTxConfirmed: () => {
          //
        },
        onTxFailed: () => {
          //
        }
      });
      return signature.value;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async function approveMigration(limit = '0'): Promise<any> {
    console.log('args', amount, tokens, signature.value);
    const decimals = 10;
    const _tokens: any[] = tokens.map(token => ({
      ...token,
      balance: BigNumber.from(token.balance)
    }));
    console.log('_tokens', _tokens);
    const approve = balancer.zaps.migrations.bbaUsd(
      account.value,
      amount,
      limit,
      signature.value,
      false,
      _tokens
    );

    return approve;
  }
  return { getUserSignature, approveMigration, actions };
}
