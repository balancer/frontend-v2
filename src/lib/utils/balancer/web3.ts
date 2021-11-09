import { Contract } from '@ethersproject/contracts';
import {
  JsonRpcProvider,
  TransactionResponse,
  Web3Provider
} from '@ethersproject/providers';
import { ErrorCode } from '@ethersproject/logger';
import { logFailedTx } from '@/lib/utils/logging';
import GasPriceService from '@/services/gas-price/gas-price.service';
import {
  EthereumTxType,
  ethereumTxType
} from '@/composables/useEthereumTxType';
import { MetamaskError } from '@/types';

const ENV = process.env.VUE_APP_ENV || 'development';
// only disable if set to "false"
const USE_BLOCKNATIVE_GAS_PLATFORM =
  process.env.VUE_APP_USE_BLOCKNATIVE_GAS_PLATFORM === 'false' ? false : true;
const GAS_LIMIT_BUFFER = 0.1;

const RPC_INVALID_PARAMS_ERROR_CODE = -32602;
const EIP1559_UNSUPPORTED_REGEX = /network does not support EIP-1559/i;

const gasPriceService = new GasPriceService();

export async function sendTransaction(
  web3: Web3Provider | JsonRpcProvider,
  contractAddress: string,
  abi: any[],
  action: string,
  params: any[],
  overrides: Record<string, any> = {},
  forceEthereumLegacyTxType = false
): Promise<TransactionResponse> {
  console.log('Sending transaction');
  console.log('Contract', contractAddress);
  console.log('Action', `"${action}"`);
  console.log('Params', params);
  const signer = web3.getSigner();
  const contract = new Contract(contractAddress, abi, web3);
  const contractWithSigner = contract.connect(signer);
  const paramsOverrides = { ...overrides };

  try {
    // Gas estimation
    const gasLimitNumber = await contractWithSigner.estimateGas[action](
      ...params,
      paramsOverrides
    );

    const gasLimit = gasLimitNumber.toNumber();
    paramsOverrides.gasLimit = Math.floor(gasLimit * (1 + GAS_LIMIT_BUFFER));

    if (
      USE_BLOCKNATIVE_GAS_PLATFORM &&
      paramsOverrides.gasPrice == null &&
      paramsOverrides.maxFeePerGas == null &&
      paramsOverrides.maxPriorityFeePerGas == null
    ) {
      const gasPrice = await gasPriceService.getLatest();
      if (gasPrice != null) {
        if (
          ethereumTxType.value === EthereumTxType.EIP1559 &&
          gasPrice.maxFeePerGas != null &&
          gasPrice.maxPriorityFeePerGas != null &&
          !forceEthereumLegacyTxType
        ) {
          paramsOverrides.maxFeePerGas = gasPrice.maxFeePerGas;
          paramsOverrides.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;
        } else {
          paramsOverrides.gasPrice = gasPrice.price;
        }
      }
    }
    return await contractWithSigner[action](...params, paramsOverrides);
  } catch (e) {
    const error = e as MetamaskError;

    if (
      error.code === RPC_INVALID_PARAMS_ERROR_CODE &&
      EIP1559_UNSUPPORTED_REGEX.test(error.message)
    ) {
      // Sending tx as EIP1559 has failed, retry with legacy tx type
      return sendTransaction(
        web3,
        contractAddress,
        abi,
        action,
        params,
        overrides,
        true
      );
    } else if (
      error.code === ErrorCode.UNPREDICTABLE_GAS_LIMIT &&
      ENV !== 'development'
    ) {
      const sender = await web3.getSigner().getAddress();
      logFailedTx(sender, contract, action, params, overrides);
    }
    return Promise.reject(error);
  }
}

export async function callStatic(
  web3,
  contractAddress: string,
  abi: any[],
  action: string,
  params: any[],
  overrides = {}
) {
  console.log('Sending transaction');
  console.log('Contract', contractAddress);
  console.log('Action', `"${action}"`);
  console.log('Params', params);
  const signer = web3.getSigner();
  const contract = new Contract(contractAddress, abi, web3);
  const contractWithSigner = contract.connect(signer);
  return await contractWithSigner.callStatic[action](...params, overrides);
}

export async function call(provider, abi: any[], call: any[], options?) {
  const contract = new Contract(call[0], abi, provider);
  try {
    const params = call[2] || [];
    return await contract[call[1]](...params, options || {});
  } catch (e) {
    return Promise.reject(e);
  }
}
