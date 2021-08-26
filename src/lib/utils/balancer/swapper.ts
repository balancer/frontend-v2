import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import { Swap } from '@balancer-labs/sor/dist/types';
import { SwapV2 } from '@balancer-labs/sor2';
import { BigNumber } from 'bignumber.js';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import exchangeProxyAbi from '@/lib/abi/ExchangeProxy.json';
import vaultAbi from '@/lib/abi/Vault.json';
import lidoRelayerAbi from '@/lib/abi/LidoRelayer.json';
import configs from '@/lib/config';
import { SorReturn } from '@/lib/utils/balancer/helpers/sor/sorManager';
import { NATIVE_ASSET_ADDRESS } from '@/constants/tokens';
import { getWstETHByStETH, isStETH } from './lido';
import { configService } from '@/services/config/config.service';
import { bnum } from '..';

const SWAP_KIND_IN = 0;
const SWAP_KIND_OUT = 1;

type FundManagement = {
  sender: string;
  recipient: string;
  fromInternalBalance: boolean;
  toInternalBalance: boolean;
};

type SingleSwap = {
  poolId: string;
  kind: number;
  assetIn: string;
  assetOut: string;
  amount: string;
  userData: string;
};

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
    overrides.value = `0x${tokenInAmount.toString(16)}`;
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
    overrides.value = `0x${tokenInAmountMax.toString(16)}`;
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
    overrides.value = `0x${tokenInAmount.toString(16)}`;
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
      limits[i] = tokenOutAmountMin.times(-1).toString();
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
        kind: SWAP_KIND_IN,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.vault,
        vaultAbi,
        'swap',
        [single, funds, tokenOutAmountMin.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.vault,
      vaultAbi,
      'batchSwap',
      [SWAP_KIND_IN, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenInV2 Error:', e);
    return Promise.reject(e);
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
    overrides.value = `0x${tokenInAmountMax.toString(16)}`;
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
      limits[i] = tokenOutAmount.times(-1).toString();
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
        kind: SWAP_KIND_OUT,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.vault,
        vaultAbi,
        'swap',
        [single, funds, tokenInAmountMax.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.vault,
      vaultAbi,
      'batchSwap',
      [SWAP_KIND_OUT, swaps, tokenAddresses, funds, limits, MaxUint256],
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
    overrides.value = `0x${tokenInAmount.toString(16)}`;
  }

  // Convert tokenIn/tokenOut so that it matches what's in tokenAddresses
  const { stETH, wstETH } = configService.network.addresses;
  if (tokenIn === stETH.toLowerCase()) {
    tokenIn = wstETH.toLowerCase();
    tokenInAmount = bnum(await getWstETHByStETH(tokenInAmount.toString()));
  } else if (tokenOut === stETH.toLowerCase()) {
    tokenOut = wstETH.toLowerCase();
    tokenOutAmountMin = bnum(
      await getWstETHByStETH(tokenOutAmountMin.toString())
    );
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
      limits[i] = tokenOutAmountMin.times(-1).toString();
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
        kind: SWAP_KIND_IN,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.lidoRelayer,
        lidoRelayerAbi,
        'swap',
        [single, funds, tokenOutAmountMin.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.lidoRelayer,
      lidoRelayerAbi,
      'batchSwap',
      [SWAP_KIND_IN, swaps, tokenAddresses, funds, limits, MaxUint256],
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
    overrides.value = `0x${tokenInAmountMax.toString(16)}`;
  }

  // Convert tokenIn/tokenOut so that it matches what's in tokenAddresses
  const { stETH, wstETH } = configService.network.addresses;
  if (tokenIn === stETH.toLowerCase()) {
    tokenIn = wstETH.toLowerCase();
    tokenInAmountMax = bnum(
      await getWstETHByStETH(tokenInAmountMax.toString())
    );
  } else if (tokenOut === stETH.toLowerCase()) {
    tokenOut = wstETH.toLowerCase();
    tokenOutAmount = bnum(await getWstETHByStETH(tokenOutAmount.toString()));
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
      limits[i] = tokenOutAmount.times(-1).toString();
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
        kind: SWAP_KIND_OUT,
        assetIn: tokenAddresses[swaps[0].assetInIndex],
        assetOut: tokenAddresses[swaps[0].assetOutIndex],
        amount: swaps[0].amount,
        userData: swaps[0].userData
      };

      return sendTransaction(
        web3,
        configs[network].addresses.lidoRelayer,
        lidoRelayerAbi,
        'swap',
        [single, funds, tokenInAmountMax.toString(), MaxUint256],
        overrides
      );
    }

    return sendTransaction(
      web3,
      configs[network].addresses.lidoRelayer,
      lidoRelayerAbi,
      'batchSwap',
      [SWAP_KIND_OUT, swaps, tokenAddresses, funds, limits, MaxUint256],
      overrides
    );
  } catch (e) {
    console.log('[Swapper] batchSwapGivenOut Error:', e);
    return Promise.reject(e);
  }
}
