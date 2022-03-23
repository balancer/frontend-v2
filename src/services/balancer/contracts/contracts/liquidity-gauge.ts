import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { web3Service } from '@/services/web3/web3.service';
import { BigNumber } from '@ethersproject/bignumber';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcProvider } from '@ethersproject/providers';
import { getAddress, formatUnits } from 'ethers/lib/utils';
import { mapValues } from 'lodash';

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

  async stake(amount: BigNumber) {
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

  async workingSupplies(gaugeAddresses: string[]) {
    const multicaller = this.getMulticaller();
    for (const gaugeAddress of gaugeAddresses) {
      multicaller.call(gaugeAddress, this.address, 'working_supply');
    }
    const result = await multicaller.execute();
    const supplies = mapValues(result, weight => formatUnits(weight, 18));
    return supplies;
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
