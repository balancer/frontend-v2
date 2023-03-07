import BalancerMinterAbi from '@/lib/abi/BalancerMinter.json';
import { configService } from '@/services/config/config.service';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';

export class BalancerMinter {
  constructor(
    private readonly abi = BalancerMinterAbi,
    private readonly config = configService,
    private readonly walletService = walletServiceInstance,
    public readonly address = config.network.addresses.balancerMinter
  ) {}

  /**
   * @summary Claim BAL rewards for gauge
   */
  async mint(gaugeAddress: string) {
    return await this.walletService.txBuilder.contract.sendTransaction({
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
    return await this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'mintMany',
      params: [gaugeAddresses],
    });
  }
}

export const balancerMinter = new BalancerMinter();
