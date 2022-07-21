import { balancerContractsService } from '@/services/balancer/contracts/balancer-contracts.service';
import { configService } from '@/services/config/config.service';
import useWeb3 from '@/services/web3/useWeb3';

const HALF_HOUR = 30 * 60 * 1000;

export function usePoolMigration() {
  /**
   * COMPOSABLES
   */
  const { appNetworkConfig, account } = useWeb3();
  const { getSigner } = useWeb3();
  const vaultAddress = appNetworkConfig.addresses.vault;

  async function getUserSignature(relayerAddress: string): Promise<string> {
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
      const signature = await signer._signTypedData(domain, types, values);
      // console.log('signature', signature);

      return signature;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  return { getUserSignature };
}
