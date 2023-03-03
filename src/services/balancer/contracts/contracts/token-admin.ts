import { Contract } from '@ethersproject/contracts';
import { formatUnits } from '@ethersproject/units';
import TokenAdminAbi from '@/lib/abi/TokenAdmin.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { getOldMulticaller } from '@/dependencies/OldMulticaller';

export class BalancerTokenAdmin {
  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = TokenAdminAbi,
    private readonly config = configService,
    private readonly walletService = walletServiceInstance
  ) {}

  async getInflationRate() {
    if (!this.address) return '0';
    const instance = new Contract(this.address, this.abi, this.provider);
    const rate = await instance.getInflationRate();
    return formatUnits(rate, 18);
  }

  private getMulticaller() {
    const Multicaller = getOldMulticaller();
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
