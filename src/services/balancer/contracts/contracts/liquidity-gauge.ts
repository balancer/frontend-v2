import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider, TransactionResponse } from '@ethersproject/providers';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { mapValues } from 'lodash';

import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { web3Service } from '@/services/web3/web3.service';

const MAX_REWARD_TOKENS = 8;

export type RewardTokenData = {
  distributor: string;
  integral: BigNumber;
  last_update: BigNumber;
  period_finish: BigNumber;
  rate: BigNumber;
  token: string;
};
export class LiquidityGauge {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = LiquidityGaugeAbi,
    private readonly config = configService,
    private readonly web3 = web3Service
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  async stake(amount: BigNumber): Promise<TransactionResponse> {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'deposit(uint256)',
      params: [amount],
    });
  }

  async unstake(amount: BigNumber): Promise<TransactionResponse> {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'withdraw(uint256)',
      params: [amount],
    });
  }

  async balance(account: string): Promise<BigNumber> {
    return this.instance.balanceOf(getAddress(account));
  }

  async totalSupply(): Promise<string> {
    const supply = await this.instance.totalSupply();
    return formatUnits(supply, 18);
  }

  /**
   * @summary Claim all user's reward tokens, e.g. everything that's not BAL
   */
  async claimRewards(): Promise<TransactionResponse> {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'claim_rewards()',
    });
  }

  async workingSupplies(gaugeAddresses: string[]) {
    const multicaller = this.getMulticaller();
    for (const gaugeAddress of gaugeAddresses) {
      multicaller.call(gaugeAddress, this.address, 'working_supply');
    }
    const result = await multicaller.execute();
    const supplies = mapValues(result, weight => formatUnits(weight, 18));
    return supplies;
  }

  async rewardData(rewardTokenAddress: string) {
    const response = this.instance.reward_data(getAddress(rewardTokenAddress));
    return response;
  }

  async getRewardTokens() {
    const multicaller = this.getMulticaller();
    for (let i = 0; i < MAX_REWARD_TOKENS; i++) {
      multicaller.call(this.address, this.address, 'reward_tokens', [i]);
    }
    const tokens = await multicaller.execute();
    return tokens;
  }

  static async getRewardTokensForGauges(
    gaugeAddresses: string[]
  ): Promise<Record<string, string[]>> {
    const multicaller = LiquidityGauge.getMulticaller();
    gaugeAddresses.forEach(gaugeAddress => {
      for (let i = 0; i < MAX_REWARD_TOKENS; i++) {
        multicaller.call(
          `${getAddress(gaugeAddress)}.[${i}]`,
          getAddress(gaugeAddress),
          'reward_tokens',
          [i]
        );
      }
    });
    const tokensForGauges = await multicaller.execute();
    return mapValues(tokensForGauges, rewardTokens =>
      rewardTokens.filter(token => token !== AddressZero)
    );
  }

  static async getRewardTokenDataForGauges(
    gaugeRewardTokenMap: Record<string, string[]>
  ) {
    const multicaller = this.getMulticaller();
    for (const gaugeAddress of Object.keys(gaugeRewardTokenMap)) {
      const _gaugeAddress = getAddress(gaugeAddress);
      for (const rewardToken of gaugeRewardTokenMap[gaugeAddress]) {
        const _rewardToken = getAddress(rewardToken);
        multicaller.call(
          `${_gaugeAddress}.${_rewardToken}`,
          _gaugeAddress,
          'reward_data',
          [_rewardToken]
        );
      }
    }
    const rewardData = await multicaller.execute();
    return rewardData;
  }

  private getMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }

  static getMulticaller(provider?: JsonRpcProvider): Multicaller {
    return new Multicaller(
      configService.network.key,
      provider || rpcProviderService.jsonProvider,
      LiquidityGaugeAbi
    );
  }
}
