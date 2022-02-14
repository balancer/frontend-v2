import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { AddressZero } from '@ethersproject/constants';
import { Contract } from '@ethersproject/contracts';

const MAX_REWARD_TOKENS = 8;

export class LiquidityGauge {
  instance: Contract;

  constructor(
    public readonly address: string = '0x5be3bbb5d7497138b9e623506d8b6c6cd72daceb',
    private readonly abi = LiquidityGaugeAbi,
    private readonly provider = rpcProviderService.jsonProvider,
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

  private getMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
