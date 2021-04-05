import { Contract } from '@ethersproject/contracts';
import { Web3Provider } from '@ethersproject/providers';
import { logFailedTx } from '@/utils/logging';

const CODE_FAILED = -32016;

export async function sendTransaction(
  web3: Web3Provider,
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
  // overrides.gasLimit = 12e6;
  try {
    return await contractWithSigner[action](...params, overrides);
  } catch (e) {
    if (e.code === CODE_FAILED) {
      const network = (await web3.getNetwork()).name;
      const sender = await web3.getSigner().getAddress();
      logFailedTx(network, sender, contract, action, params, overrides);
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
