import BalancerMinterAbi from '@/lib/abi/BalancerMinter.json';
import { configService } from '@/services/config/config.service';
import { web3Service } from '@/services/web3/web3.service';

export class BalancerMinter {
  constructor(
    private readonly abi = BalancerMinterAbi,
    private readonly config = configService,
    private readonly web3 = web3Service,
    public readonly address = config.network.addresses.balancerMinter
  ) {}

  /**
   * @summary Claim BAL rewards for gauge
   */
  async mint(gaugeAddress: string) {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'mint',
      params: [gaugeAddress],
    });
  }

  /**
   * @summary Claim BAL rewards for multiple gauges in one transaction
   */
  async mintMany(gaugeAddresses: string[]) {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'mintMany',
      params: [gaugeAddresses],
    });
  }
}

export const balancerMinter = new BalancerMinter();
