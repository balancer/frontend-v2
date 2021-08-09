import { Contract } from '@ethersproject/contracts';
import {
  JsonRpcProvider,
  TransactionResponse,
  Web3Provider
} from '@ethersproject/providers';
import { ErrorCode } from '@ethersproject/logger';
import { logFailedTx } from '@/lib/utils/logging';
import GasPriceService from '@/services/gas-price/gas-price.service';

const ENV = process.env.VUE_APP_ENV || 'development';
// only disable if set to "false"
const USE_BLOCKNATIVE_GAS_PLATFORM =
  process.env.VUE_APP_USE_BLOCKNATIVE_GAS_PLATFORM === 'false' ? false : true;
const GAS_LIMIT_BUFFER = 0.1;

const gasPriceService = new GasPriceService();

export async function sendTransaction(
  web3: Web3Provider | JsonRpcProvider,
  contractAddress: string,
  abi: any[],
  action: string,
  params: any[],
  overrides: Record<string, any> = {}
): Promise<TransactionResponse> {
  console.log('Sending transaction');
  console.log('Contract', contractAddress);
  console.log('Action', `"${action}"`);
  console.log('Params', params);
  const signer = web3.getSigner();
  const contract = new Contract(contractAddress, abi, web3);
  const contractWithSigner = contract.connect(signer);

  try {
    // Gas estimation
    const gasLimitNumber = await contractWithSigner.estimateGas[action](
      ...params,
      overrides
    );

    const gasLimit = gasLimitNumber.toNumber();
    overrides.gasLimit = Math.floor(gasLimit * (1 + GAS_LIMIT_BUFFER));

    if (USE_BLOCKNATIVE_GAS_PLATFORM && overrides.gasPrice == null) {
      const gasPrice = await gasPriceService.getLatest();
      if (gasPrice != null) {
        overrides.gasPrice = gasPrice;
      }
    }

    return await contractWithSigner[action](...params, overrides);
  } catch (e) {
    if (e.code === ErrorCode.UNPREDICTABLE_GAS_LIMIT && ENV !== 'development') {
      const sender = await web3.getSigner().getAddress();
      logFailedTx(sender, contract, action, params, overrides);
    }
    return Promise.reject(e);
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
