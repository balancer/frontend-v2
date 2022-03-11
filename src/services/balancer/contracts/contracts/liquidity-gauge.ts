import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero, MaxUint256 } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';
import { default as ERC20ABI } from '@/lib/abi/ERC20.json';

const MAX_REWARD_TOKENS = 8;

export class LiquidityGauge {
  instance: Contract;

  constructor(
    public readonly address: string = '0x5be3bbb5d7497138b9e623506d8b6c6cd72daceb',
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = LiquidityGaugeAbi,
    private readonly config = configService
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

  async approve(bptAddress: string) {
    const bptContract = new Contract(bptAddress, ERC20ABI, this.provider);
    const tx = bptContract
      .connect(this.provider.getSigner())
      .approve(this.address, MaxUint256);
    return tx;
  }

  async stake(amount: BigNumber) {
    console.log('amount', amount.toString());
    const tx = this.instance
      .connect(this.provider.getSigner())
      ['deposit(uint256)'](amount);
    return tx;
  }

  private getMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
