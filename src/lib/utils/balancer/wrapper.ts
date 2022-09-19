import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';

import configs from '@/lib/config';
import { configService } from '@/services/config/config.service';

import { getStETHByWstETH, getWstETHByStETH } from './lido';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

export enum WrapType {
  NonWrap = 0,
  Wrap,
  Unwrap,
}

export const isNativeAssetWrap = (
  tokenIn: string,
  tokenOut: string
): boolean => {
  const nativeAddress = configService.network.nativeAsset.address;
  const { weth } = configService.network.addresses;
  return tokenIn === nativeAddress && tokenOut === weth;
};

export const getWrapAction = (tokenIn: string, tokenOut: string): WrapType => {
  const nativeAddress = configService.network.nativeAsset.address;
  const { weth, stETH, wstETH } = configService.network.addresses;

  if (tokenIn === nativeAddress && tokenOut === weth) return WrapType.Wrap;
  if (tokenIn === stETH && tokenOut === wstETH) return WrapType.Wrap;

  if (tokenOut === nativeAddress && tokenIn === weth) return WrapType.Unwrap;
  if (tokenOut === stETH && tokenIn === wstETH) return WrapType.Unwrap;

  return WrapType.NonWrap;
};

export const getWrapOutput = (
  wrapper: string,
  wrapType: WrapType,
  wrapAmount: BigNumberish
): BigNumber => {
  if (wrapType === WrapType.NonWrap) throw new Error('Invalid wrap type');
  const { weth, wstETH } = configService.network.addresses;

  if (wrapper === weth) return BigNumber.from(wrapAmount);
  if (wrapper === wstETH) {
    return wrapType === WrapType.Wrap
      ? getWstETHByStETH(wrapAmount)
      : getStETHByWstETH(wrapAmount);
  }
  throw new Error('Unknown wrapper');
};

export async function wrap(
  network: string,
  web3: Web3Provider,
  wrapper: string,
  amount: BigNumber
): Promise<TransactionResponse> {
  try {
    if (wrapper === configs[network].addresses.weth) {
      return wrapNative(network, web3, amount);
    } else if (wrapper === configs[network].addresses.wstETH) {
      return wrapLido(network, web3, amount);
    }
    throw new Error('Unrecognised wrapper contract');
  } catch (e) {
    console.log('[Wrapper] Wrap error:', e);
    return Promise.reject(e);
  }
}

export async function unwrap(
  network: string,
  web3: Web3Provider,
  wrapper: string,
  amount: BigNumber
): Promise<TransactionResponse> {
  try {
    if (wrapper === configs[network].addresses.weth) {
      return unwrapNative(network, web3, amount);
    } else if (wrapper === configs[network].addresses.wstETH) {
      return unwrapLido(network, web3, amount);
    }
    throw new Error('Unrecognised wrapper contract');
  } catch (e) {
    console.log('[Wrapper] Unwrap error:', e);
    return Promise.reject(e);
  }
}

const wrapNative = async (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> => {
  const txBuilder = new TransactionBuilder(web3.getSigner());
  return await txBuilder.contract.sendTransaction({
    contractAddress: configs[network].addresses.weth,
    abi: ['function deposit() payable'],
    action: 'deposit',
    options: { value: amount },
  });
};

const unwrapNative = async (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> => {
  const txBuilder = new TransactionBuilder(web3.getSigner());
  return await txBuilder.contract.sendTransaction({
    contractAddress: configs[network].addresses.weth,
    abi: ['function withdraw(uint256 wad)'],
    action: 'withdraw',
    params: [amount],
  });
};

const wrapLido = async (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> => {
  const txBuilder = new TransactionBuilder(web3.getSigner());
  return await txBuilder.contract.sendTransaction({
    contractAddress: configs[network].addresses.wstETH,
    abi: ['function wrap(uint256 _stETHAmount) returns (uint256)'],
    action: 'wrap',
    params: [amount],
  });
};

const unwrapLido = async (
  network: string,
  web3: Web3Provider,
  amount: BigNumber
): Promise<TransactionResponse> => {
  const txBuilder = new TransactionBuilder(web3.getSigner());
  return await txBuilder.contract.sendTransaction({
    contractAddress: configs[network].addresses.wstETH,
    abi: ['function unwrap(uint256 _wstETHAmount) returns (uint256)'],
    action: 'unwrap',
    params: [amount],
  });
};
