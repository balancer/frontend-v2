import LiquidityGaugeAbi from '@/lib/abi/LiquidityGaugeV5.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { Contract } from '@ethersproject/contracts';

export class LiquidityGauge {
  instance: Contract;

  constructor(
    public readonly address: string = '0x5be3bbb5d7497138b9e623506d8b6c6cd72daceb',
    private readonly abi = LiquidityGaugeAbi,
    private readonly provider = rpcProviderService.jsonProvider
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  async getRewardTokens(): Promise<string[]> {
    return await this.instance.get_reward_tokens();
  }
}
