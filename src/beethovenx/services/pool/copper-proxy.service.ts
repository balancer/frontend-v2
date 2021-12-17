import { TransactionResponse } from '@ethersproject/abstract-provider';
import configs from '@/lib/config';
import { callStatic, sendTransaction } from '@/lib/utils/balancer/web3';
import { default as CopperProxyAbi } from '@/beethovenx/abi/CopperProxy.json';
import {
  JsonRpcProvider,
  TransactionReceipt,
  Web3Provider
} from '@ethersproject/providers';
import { TokenInfoMap } from '@/types/TokenList';
import { orderBy } from 'lodash';
import { bnToNormalizedWeights } from '@/beethovenx/utils/numbers';
import { parseUnits } from '@ethersproject/units';
import { LgeData } from '@/beethovenx/lbp/lbp-types';
import { getAddress } from '@ethersproject/address';
import { BigNumber } from '@ethersproject/bignumber';
import { parseISO, getUnixTime } from 'date-fns';
import { default as ERC20Abi } from '@/lib/abi/ERC20.json';
import { encodeJoinWeightedPool } from '@/lib/utils/balancer/weightedPoolEncoding';

interface PoolTokenInput {
  address: string;
  startWeight: BigNumber;
  endWeight: BigNumber;
  amount: BigNumber;
}

export class CopperProxyService {
  network: string;
  copperProxyAddress: string;

  constructor(network: string) {
    this.network = network;
    this.copperProxyAddress = configs[network].addresses.copperProxy;
  }

  public async createAuction(
    provider: Web3Provider | JsonRpcProvider,
    data: LgeData,
    tokenInfoMap: TokenInfoMap
  ): Promise<TransactionResponse> {
    const sorted = this.toSortedTokens(data, tokenInfoMap);
    return await sendTransaction(
      provider,
      this.copperProxyAddress,
      CopperProxyAbi,
      'createAuction',
      [
        {
          name: data.poolName,
          symbol: `BPT-${data.poolSymbol}`,
          tokens: sorted.map(token => token.address),
          amounts: sorted.map(token => token.amount),
          weights: bnToNormalizedWeights(
            sorted.map(token => token.startWeight)
          ),
          endWeights: bnToNormalizedWeights(
            sorted.map(token => token.endWeight)
          ),
          isCorrectOrder: this.isCorrectOrder(
            sorted,
            data.collateralTokenAddress
          ),
          //swap fee come in as 1 = 1%, so its base 16
          swapFeePercentage: parseUnits(`${data.swapFeePercentage}`, 16),
          userData: encodeJoinWeightedPool({
            kind: 'Init',
            amountsIn: sorted.map(token => token.amount.toString())
          }),
          startTime: getUnixTime(
            parseISO(`${data.startDate}T${data.startTime}:00Z`)
          ),
          endTime: getUnixTime(parseISO(`${data.endDate}T${data.endTime}:00Z`))
        }
      ]
    );
  }

  public async setSwapEnabled(
    provider: Web3Provider | JsonRpcProvider,
    poolAddress: string,
    enabled: boolean
  ): Promise<TransactionResponse> {
    return await sendTransaction(
      provider,
      this.copperProxyAddress,
      CopperProxyAbi,
      'setSwapEnabled',
      [getAddress(poolAddress), enabled]
    );
  }

  public async exitPool(
    provider: Web3Provider | JsonRpcProvider,
    poolAddress: string
  ): Promise<TransactionResponse> {
    return await sendTransaction(
      provider,
      this.copperProxyAddress,
      CopperProxyAbi,
      'exitPool',
      [getAddress(poolAddress), [0, 0], 0]
    );
  }

  async approveToken(
    web3: Web3Provider,
    token: string,
    amount: string
  ): Promise<TransactionResponse> {
    return sendTransaction(web3, token, ERC20Abi, 'approve', [
      this.copperProxyAddress,
      amount
    ]);
  }

  private toSortedTokens(
    data: LgeData,
    tokenInfoMap: TokenInfoMap
  ): PoolTokenInput[] {
    const collateralTokenAddress = getAddress(data.collateralTokenAddress);
    const tokenAddress = getAddress(data.tokenContractAddress);

    return this.sortTokens([
      {
        address: collateralTokenAddress,
        amount: parseUnits(
          data.collateralAmount,
          tokenInfoMap[collateralTokenAddress].decimals
        ),
        //weights come in as 1 = 1%, so its base 16
        startWeight: parseUnits(`${data.collateralStartWeight}`, 16),
        endWeight: parseUnits(`${data.collateralEndWeight}`, 16)
      },
      {
        address: tokenAddress,
        amount: parseUnits(
          data.collateralAmount,
          tokenInfoMap[tokenAddress].decimals
        ),
        startWeight: parseUnits(`${data.tokenStartWeight}`, 16),
        endWeight: parseUnits(`${data.tokenEndWeight}`, 16)
      }
    ]);
  }

  private sortTokens(tokens: PoolTokenInput[]): PoolTokenInput[] {
    return orderBy(tokens, token => token.address.toLowerCase(), 'asc');
  }

  //true if, collateral token is index 0
  private isCorrectOrder(
    sortedTokens: PoolTokenInput[],
    collateralTokenAddress: string
  ) {
    return (
      sortedTokens[0].address.toLowerCase() ===
      collateralTokenAddress.toLowerCase()
    );
  }
}
