import BalancerMinterAbi from '@/lib/abi/BalancerMinter.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { web3Service } from '@/services/web3/web3.service';
import { Contract } from '@ethersproject/contracts';

export class BalancerMinter {
  instance: Contract;

  constructor(
    private readonly abi = BalancerMinterAbi,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly config = configService,
    private readonly web3 = web3Service,
    public readonly address = config.network.addresses.balancerMinter
  ) {
    if (!this.address) console.error('BalancerMinter address not set');
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  /**
   * @summary Claim BAL rewards for gauge
   */
  async mint(gaugeAddress: string) {
    return await this.web3.sendTransaction(this.address, this.abi, 'mint', [
      gaugeAddress
    ]);
  }

  /**
   * @summary Claim BAL rewards for multiple gauges in one transaction
   */
  async mintMany(gaugeAddresses: string[]) {
    return await this.web3.sendTransaction(this.address, this.abi, 'mintMany', [
      gaugeAddresses
    ]);
  }
}

export const balancerMinter = new BalancerMinter();
