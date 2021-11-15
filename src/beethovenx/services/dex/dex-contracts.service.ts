import { Config } from '@/lib/config';
import { JsonRpcProvider } from '@ethersproject/providers';
import { rpcProviderService as _rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { configService as _configService } from '@/services/config/config.service';
import UniSwapRouter from '@/beethovenx/services/dex/contracts/uni-swap-router';

export default class DexContractsService {
  public readonly spookySwap: UniSwapRouter;
  public readonly spiritSwap: UniSwapRouter;
  private readonly config: Config;
  private readonly provider: JsonRpcProvider;

  constructor(
    readonly configService = _configService,
    readonly rpcProviderService = _rpcProviderService
  ) {
    this.provider = this.rpcProviderService.jsonProvider;
    this.config = this.configService.network;

    this.spookySwap = new UniSwapRouter(
      this,
      '0xF491e7B69E4244ad4002BC14e878a34207E38c29'
    );
    this.spiritSwap = new UniSwapRouter(
      this,
      '0x16327e3fbdaca3bcf7e38f5af2599d2ddc33ae52'
    );
  }
}

export const dexContractsService = new DexContractsService();
