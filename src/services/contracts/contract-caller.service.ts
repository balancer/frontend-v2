import { Contract } from '@ethersproject/contracts';
import { ErrorCode } from '@ethersproject/logger';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { logFailedTx } from '@/lib/utils/logging';
import { gasPriceService } from '@/services/gas-price/gas-price.service';
import useWeb3 from '@/services/web3/useWeb3';

const ENV = process.env.VUE_APP_ENV || 'development';
const RPC_INVALID_PARAMS_ERROR_CODE = -32602;
const EIP1559_UNSUPPORTED_REGEX = /network does not support EIP-1559/i;

export default class ContractCaller {
  public async sendTransaction(
    contractAddress: string,
    abi: any[],
    action: string,
    params: any[],
    options: Record<string, any>,
    forceEthereumLegacyTxType = false
  ): Promise<TransactionResponse> {
    const { getProvider } = useWeb3();
    const provider: Web3Provider = getProvider();

    const signer = provider.getSigner();
    const contract = new Contract(contractAddress, abi, provider);
    const contractWithSigner = contract.connect(signer);

    try {
      const gasPriceSettings = gasPriceService.getGasSettingsForContractCall(
        contractWithSigner,
        action,
        params,
        options,
        forceEthereumLegacyTxType
      );
      options = { ...options, ...gasPriceSettings };

      return await contractWithSigner[action](...params, options);
    } catch (e) {
      if (
        e.code === RPC_INVALID_PARAMS_ERROR_CODE &&
        EIP1559_UNSUPPORTED_REGEX.test(e.message)
      ) {
        // Sending tx as EIP1559 has failed, retry with legacy tx type
        return this.sendTransaction(
          contractAddress,
          abi,
          action,
          params,
          options,
          true
        );
      } else if (
        e.code === ErrorCode.UNPREDICTABLE_GAS_LIMIT &&
        ENV !== 'development'
      ) {
        const sender = await signer.getAddress();
        logFailedTx(sender, contract, action, params, options);
      }
      return Promise.reject(e);
    }
  }
}

export const contractCaller = new ContractCaller();
