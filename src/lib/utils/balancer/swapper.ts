import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import { Vault__factory, LidoRelayer__factory } from '@balancer-labs/typechain';
import { Swap } from '@balancer-labs/sor/dist/types';
import { SwapV2 } from '@balancer-labs/sor2';
import { BigNumber } from '@ethersproject/bignumber';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import exchangeProxyAbi from '@/lib/abi/ExchangeProxy.json';
import configs from '@/lib/config';
import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { getWstETHByStETH, isStETH } from './lido';
import { configService } from '@/services/config/config.service';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';
import { BatchSwapStep } from '@balancer-labs/sdk';
import { bnum } from '..';

export async function swapIn(
  network: string,
  provider: Web3Provider,
  sorReturn: SorReturn,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber
): Promise<TransactionResponse> {
  if (isStETH(sorReturn.v2result.tokenIn, sorReturn.v2result.tokenOut)) {
    return lidoBatchSwapGivenIn(
      network,
      provider,
      sorReturn.v2result.tokenIn,
      sorReturn.v2result.tokenOut,
      tokenInAmount,
      tokenOutAmountMin,
      sorReturn.v2result.swaps,
      sorReturn.v2result.tokenAddresses
    );
  } else if (sorReturn.isV1swap) {
    return batchSwapGivenInV1(
      network,
      provider,
      sorReturn.tokenIn,
      sorReturn.tokenOut,
      tokenInAmount,
      tokenOutAmountMin,
      sorReturn.v1result[0]
    );
  } else {
    return batchSwapGivenInV2(
      network,
      provider,
      sorReturn.v2result.tokenIn,
      sorReturn.v2result.tokenOut,
      tokenInAmount,
      tokenOutAmountMin,
      sorReturn.v2result.swaps,
      sorReturn.v2result.tokenAddresses
    );
  }
}

export async function swapOut(
  network: string,
  provider: Web3Provider,
  sorReturn: SorReturn,
  tokenInAmountMax: BigNumber,
  tokenOutAmount: BigNumber
): Promise<TransactionResponse> {
  if (isStETH(sorReturn.v2result.tokenIn, sorReturn.v2result.tokenOut)) {
    return lidoBatchSwapGivenOut(
      network,
      provider,
      sorReturn.v2result.tokenIn,
      sorReturn.v2result.tokenOut,
      tokenInAmountMax,
      tokenOutAmount,
      sorReturn.v2result.swaps,
      sorReturn.v2result.tokenAddresses
    );
  } else if (sorReturn.isV1swap) {
    return batchSwapGivenOutV1(
      network,
      provider,
      sorReturn.tokenIn,
      sorReturn.tokenOut,
      tokenInAmountMax,
      sorReturn.v1result[0]
    );
  } else {
    return batchSwapGivenOutV2(
      network,
      provider,
      sorReturn.v2result.tokenIn,
      sorReturn.v2result.tokenOut,
      tokenInAmountMax,
      tokenOutAmount,
      sorReturn.v2result.swaps,
      sorReturn.v2result.tokenAddresses
    );
  }
}

export async function batchSwapGivenInV1(
  network: string,
  web3: Web3Provider,
  tokenIn: string,
  tokenOut: string,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber,
  swaps: Swap[][]
): Promise<TransactionResponse> {
  console.log('[Swapper] batchSwapGivenInV1');
  const overrides: any = {};

  if (tokenIn === NATIVE_ASSET_ADDRESS) {
    overrides.value = tokenInAmount.toHexString();
  }

  try {
    return sendTransaction(
      web3,
      configs[network].addresses.exchangeProxy,
      exchangeProxyAbi,
      'multihopBatchSwapExactIn',
      [
        swaps,
        tokenIn,
        tokenOut,
        tokenInAmount.toString(),
        tokenOutAmountMin.toString()
      ],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenInV1 Error:', e);
    return Promise.reject(e);
  }
}

export async function batchSwapGivenOutV1(
  network: string,
  web3: Web3Provider,
  tokenIn: string,
  tokenOut: string,
  tokenInAmountMax: BigNumber,
  swaps: Swap[][]
): Promise<TransactionResponse> {
  console.log('[Swapper] batchSwapGivenOutV1');
  const overrides: any = {};

  if (tokenIn === NATIVE_ASSET_ADDRESS) {
    overrides.value = tokenInAmountMax.toHexString();
  }

  try {
    return sendTransaction(
      web3,
      configs[network].addresses.exchangeProxy,
      exchangeProxyAbi,
      'multihopBatchSwapExactOut',
      [swaps, tokenIn, tokenOut, tokenInAmountMax.toString()],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenOutV1 Error:', e);
    return Promise.reject(e);
  }
}

async function batchSwapGivenInV2(
  network: string,
  web3: Web3Provider,
  tokenIn: string,
  tokenOut: string,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber,
  swaps: SwapV2[],
  tokenAddresses: string[]
): Promise<TransactionResponse> {
  console.log('[Swapper] batchSwapGivenInV2');
  const overrides: any = {};

  if (tokenIn === AddressZero) {
    overrides.value = tokenInAmount.toHexString();
  }

  const address = await web3.getSigner().getAddress();

  const funds: FundManagement = {
    sender: address,
    recipient: address,
    fromInternalBalance: false,
    toInternalBalance: false
  };

  // Limits:
  // +ve means max to send
  // -ve mean min to receive
  // For a multihop the intermediate tokens should be 0
  const limits: string[] = [];
  tokenAddresses.forEach((token, i) => {
    if (token.toLowerCase() === tokenIn.toLowerCase()) {
      limits[i] = tokenInAmount.toString();
    } else if (token.toLowerCase() === tokenOut.toLowerCase()) {
      limits[i] = tokenOutAmountMin.mul(-1).toString();
    } else {
      limits[i] = '0';
    }
  });
  console.log('Limits', limits);

  try {
    // Do a single swap instead of a batch to save gas
    if (swaps.length == 1) {
      console.log('[Swapper] Overriding with single swap() GivenIn');

      const single: SingleSwap = {
        poolId: swaps[0].poolId,
        kind: SwapKind.GivenIn,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.vault,
        Vault__factory.abi,
        'swap',
        [single, funds, tokenOutAmountMin.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.vault,
      Vault__factory.abi,
      'batchSwap',
      [SwapKind.GivenIn, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenInV2 Error:', e);
    return Promise.reject(e);
  }
}

/**
 * Join a Boosted Pool (StablePhantom) using a batch swap
 */
export async function boostedJoinBatchSwap(
  network: string,
  web3: Web3Provider,
  swaps: SwapV2[],
  tokenAddresses: string[],
  tokenOut: string,
  amountsInMap: Record<string, BigNumber>,
  amountOutMin: BigNumber
) {
  try {
    const address = await web3.getSigner().getAddress();
    const overrides: any = {};
    const tokensIn: string[] = Object.keys(amountsInMap);

    const funds: FundManagement = {
      sender: address,
      recipient: address,
      fromInternalBalance: false,
      toInternalBalance: false
    };

    // Limits:
    // +ve means max to send
    // -ve mean min to receive
    // For a multihop the intermediate tokens should be 0
    const limits: string[] = [];
    tokenAddresses.forEach((token, i) => {
      if (tokensIn.includes(token.toLowerCase())) {
        limits[i] = amountsInMap[token].toString();
      } else if (token.toLowerCase() === tokenOut.toLowerCase()) {
        limits[i] = amountOutMin.mul(-1).toString();
      } else {
        limits[i] = '0';
      }
    });

    return sendTransaction(
      web3,
      configs[network].addresses.vault,
      Vault__factory.abi,
      'batchSwap',
      [SwapKind.GivenIn, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (error) {
    console.log('[Swapper] batchSwapGivenInV2 Error:', error);
    throw error;
  }
}

/**
 * Exit a Boosted Pool (StablePhantom) using a batch swap
 */
export async function boostedExitBatchSwap(
  network: string,
  web3: Web3Provider,
  swaps: BatchSwapStep[],
  tokenAddresses: string[],
  tokenIn: string,
  amountIn: string,
  amountsOutMap: Record<string, string>,
  swapKind: SwapKind = SwapKind.GivenIn
): Promise<TransactionResponse> {
  try {
    const address = await web3.getSigner().getAddress();
    const overrides: any = {};
    const tokensOut: string[] = Object.keys(amountsOutMap);

    const funds: FundManagement = {
      sender: address,
      recipient: address,
      fromInternalBalance: false,
      toInternalBalance: false
    };

    // Limits:
    // +ve means max to send
    // -ve mean min to receive
    // For a multihop the intermediate tokens should be 0
    const limits: string[] = [];
    tokenAddresses.forEach((token, i) => {
      if (tokensOut.includes(token.toLowerCase())) {
        limits[i] = bnum(amountsOutMap[token])
          .times(-1)
          .toString();
      } else if (token.toLowerCase() === tokenIn.toLowerCase()) {
        limits[i] = bnum(amountIn)
          .abs()
          .toString();
      } else {
        limits[i] = '0';
      }
    });

    console.log('limits', limits);

    return sendTransaction(
      web3,
      configs[network].addresses.vault,
      Vault__factory.abi,
      'batchSwap',
      [swapKind, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (error) {
    console.log('[Swapper] batchSwapGivenInV2 Error:', error);
    throw error;
  }
}

async function batchSwapGivenOutV2(
  network: string,
  web3: Web3Provider,
  tokenIn: string,
  tokenOut: string,
  tokenInAmountMax: BigNumber,
  tokenOutAmount: BigNumber,
  swaps: SwapV2[],
  tokenAddresses: string[]
): Promise<TransactionResponse> {
  console.log('[Swapper] batchSwapGivenOutV2');
  const overrides: any = {};

  if (tokenIn === AddressZero) {
    overrides.value = tokenInAmountMax.toHexString();
  }

  const address = await web3.getSigner().getAddress();

  const funds: FundManagement = {
    sender: address,
    recipient: address,
    fromInternalBalance: false,
    toInternalBalance: false
  };

  // Limits:
  // +ve means max to send
  // -ve mean min to receive
  // For a multihop the intermediate tokens should be 0
  const limits: string[] = [];
  tokenAddresses.forEach((token, i) => {
    if (token.toLowerCase() === tokenIn.toLowerCase()) {
      limits[i] = tokenInAmountMax.toString();
    } else if (token.toLowerCase() === tokenOut.toLowerCase()) {
      limits[i] = tokenOutAmount.mul(-1).toString();
    } else {
      limits[i] = '0';
    }
  });
  console.log('Limits', limits);

  try {
    // Do a single swap instead of a batch to save gas
    if (swaps.length == 1) {
      console.log('[Swapper] Overriding with single swap() GivenOut');

      const single: SingleSwap = {
        poolId: swaps[0].poolId,
        kind: SwapKind.GivenOut,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.vault,
        Vault__factory.abi,
        'swap',
        [single, funds, tokenInAmountMax.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.vault,
      Vault__factory.abi,
      'batchSwap',
      [SwapKind.GivenOut, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenOutV2 Error:', e);
    return Promise.reject(e);
  }
}

async function lidoBatchSwapGivenIn(
  network: string,
  web3: Web3Provider,
  tokenIn: string,
  tokenOut: string,
  tokenInAmount: BigNumber,
  tokenOutAmountMin: BigNumber,
  swaps: SwapV2[],
  tokenAddresses: string[]
): Promise<TransactionResponse> {
  console.log('[Swapper] lidoBatchSwapGivenIn');
  const overrides: any = {};

  if (tokenIn === AddressZero) {
    overrides.value = tokenInAmount.toHexString();
  }

  // Convert tokenIn/tokenOut so that it matches what's in tokenAddresses
  const { stETH, wstETH } = configService.network.addresses;
  if (tokenIn === stETH.toLowerCase()) {
    tokenIn = wstETH.toLowerCase();
    tokenInAmount = await getWstETHByStETH(tokenInAmount);
  } else if (tokenOut === stETH.toLowerCase()) {
    tokenOut = wstETH.toLowerCase();
    tokenOutAmountMin = await getWstETHByStETH(tokenOutAmountMin);
  }

  const address = await web3.getSigner().getAddress();

  const funds: FundManagement = {
    sender: address,
    recipient: address,
    fromInternalBalance: false,
    toInternalBalance: false
  };

  // Limits:
  // +ve means max to send
  // -ve mean min to receive
  // For a multihop the intermediate tokens should be 0
  const limits: string[] = [];
  tokenAddresses.forEach((token, i) => {
    if (token.toLowerCase() === tokenIn.toLowerCase()) {
      limits[i] = tokenInAmount.toString();
    } else if (token.toLowerCase() === tokenOut.toLowerCase()) {
      limits[i] = tokenOutAmountMin.mul(-1).toString();
    } else {
      limits[i] = '0';
    }
  });
  console.log('Limits', limits);

  try {
    // Do a single swap instead of a batch to save gas
    if (swaps.length == 1) {
      console.log('[Swapper] Overriding with single swap() GivenIn');

      const single: SingleSwap = {
        poolId: swaps[0].poolId,
        kind: SwapKind.GivenIn,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.lidoRelayer,
        LidoRelayer__factory.abi,
        'swap',
        [single, funds, tokenOutAmountMin.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.lidoRelayer,
      LidoRelayer__factory.abi,
      'batchSwap',
      [SwapKind.GivenIn, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenIn Error:', e);
    return Promise.reject(e);
  }
}

async function lidoBatchSwapGivenOut(
  network: string,
  web3: Web3Provider,
  tokenIn: string,
  tokenOut: string,
  tokenInAmountMax: BigNumber,
  tokenOutAmount: BigNumber,
  swaps: SwapV2[],
  tokenAddresses: string[]
): Promise<TransactionResponse> {
  console.log('[Swapper] lidoBatchSwapGivenOut');
  const overrides: any = {};

  if (tokenIn === AddressZero) {
    overrides.value = tokenInAmountMax.toHexString();
  }

  // Convert tokenIn/tokenOut so that it matches what's in tokenAddresses
  const { stETH, wstETH } = configService.network.addresses;
  if (tokenIn === stETH.toLowerCase()) {
    tokenIn = wstETH.toLowerCase();
    tokenInAmountMax = await getWstETHByStETH(tokenInAmountMax);
  } else if (tokenOut === stETH.toLowerCase()) {
    tokenOut = wstETH.toLowerCase();
    tokenOutAmount = await getWstETHByStETH(tokenOutAmount);
  }

  const address = await web3.getSigner().getAddress();

  const funds: FundManagement = {
    sender: address,
    recipient: address,
    fromInternalBalance: false,
    toInternalBalance: false
  };

  // Limits:
  // +ve means max to send
  // -ve mean min to receive
  // For a multihop the intermediate tokens should be 0
  const limits: string[] = [];
  tokenAddresses.forEach((token, i) => {
    if (token.toLowerCase() === tokenIn.toLowerCase()) {
      limits[i] = tokenInAmountMax.toString();
    } else if (token.toLowerCase() === tokenOut.toLowerCase()) {
      limits[i] = tokenOutAmount.mul(-1).toString();
    } else {
      limits[i] = '0';
    }
  });
  console.log('Limits', limits);

  try {
    // Do a single swap instead of a batch to save gas
    if (swaps.length == 1) {
      console.log('[Swapper] Overriding with single swap() GivenOut');

      const single: SingleSwap = {
        poolId: swaps[0].poolId,
        kind: SwapKind.GivenOut,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.lidoRelayer,
        LidoRelayer__factory.abi,
        'swap',
        [single, funds, tokenInAmountMax.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.lidoRelayer,
      LidoRelayer__factory.abi,
      'batchSwap',
      [SwapKind.GivenOut, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenOut Error:', e);
    return Promise.reject(e);
  }
}
