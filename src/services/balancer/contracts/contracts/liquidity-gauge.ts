import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';
import { web3Service } from '@/services/web3/web3.service';
import { Contract } from '@ethersproject/contracts';
import { getAddress } from 'ethers/lib/utils';

const MAX_REWARD_TOKENS = 8;

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

  /**
   * @summary Fetch list of reward token addresses for gauge.
   * @returns list of reward token addresses
   */
  async getRewardTokens(): Promise<string[]> {
    const multicaller = this.getMulticaller();

    for (let i = 0; i < MAX_REWARD_TOKENS; i++) {
      multicaller.call(`tokens[${i}]`, this.address, 'reward_tokens', [i]);
    }

    const { tokens } = await multicaller.execute();

    return tokens.filter(address => address !== AddressZero);
  }

  async stake(amount: BigNumber) {
    console.log('amt', amount.toString())
    const tx = this.web3.sendTransaction(
      this.address,
      this.abi,
      'deposit(uint256)',
      [amount]
    );
    return tx;
  }

  async unstake(amount: BigNumber) {
    const tx = this.web3.sendTransaction(
      this.address,
      this.abi,
      'withdraw(uint256)',
      [amount]
    );
    return tx;
  }

  async balance(account: string): Promise<string> {
    const balance = this.instance
      .connect(this.provider.getSigner())
      .balanceOf(getAddress(account));
    return balance;
  }

  /*
   * @summary Claim all user's reward tokens, e.g. everything that's not BAL
   */
  async claimRewards() {
    return await this.web3.sendTransaction(
      this.address,
      this.abi,
      'claim_rewards()'
    );
  }

  private getMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
