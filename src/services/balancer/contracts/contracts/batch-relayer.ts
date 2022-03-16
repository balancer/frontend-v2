import { Contract } from 'ethers';
import ContractService from '../balancer-contracts.service';
import BatchRelayerAbi from '@/lib/abi/BatchRelayer.json';
import { FundManagement, SwapV2, TransactionData } from '@balancer-labs/sdk';
import { TransactionResponse, Web3Provider } from '@ethersproject/providers';
import { sendTransaction } from '@/lib/utils/balancer/web3';
import { BigNumber } from '@ethersproject/bignumber';
import configs from '@/lib/config';
import { Vault__factory } from '@balancer-labs/typechain';
import { SwapKind } from '@balancer-labs/balancer-js';
import { MaxUint256 } from '@ethersproject/constants';

export default class BatchRelayer {
  service: ContractService;
  instance: Contract;

  constructor(service, public readonly abi = BatchRelayerAbi) {
    this.service = service;

    if (!this.service.config.addresses.batchRelayer)
      throw new Error('BatchRelayer address not set');

    this.instance = new Contract(
      this.service.config.addresses.batchRelayer,
      this.abi,
      this.service.provider
    );
  }

  public get address(): string {
    return this.service.config.addresses.batchRelayer;
  }

  public async stableExitStatic(
    account: string,
    tokenIn: string,
    amountsIn: string[],
    tokensOut: string[],
    rates: string[],
    slippage: string,
    exactOut = false,
    fetchPools = true
  ): Promise<TransactionData> {
    const funds: FundManagement = {
      sender: account,
      recipient: this.address, // Note relayer is recipient of swaps
      fromInternalBalance: false,
      toInternalBalance: false
    };

    const tokensIn = tokensOut.map(() => tokenIn);

    const method = exactOut ? 'swapUnwrapExactOut' : 'swapUnwrapExactIn';

    return await this.service.sdk.relayer[method](
      tokensIn,
      tokensOut,
      amountsIn,
      rates,
      funds,
      slippage,
      {
        fetchPools,
        fetchOnChain: false
      }
    );
  }

  public async stableExit(
    txInfo: TransactionData,
    userProivder: Web3Provider,
    overrides: Record<string, any> = {}
  ): Promise<TransactionResponse> {
    return await sendTransaction(
      userProivder,
      this.address,
      this.abi,
      txInfo.function,
      [txInfo.params],
      overrides
    );
  }

  public async boostedJoin(
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
}
