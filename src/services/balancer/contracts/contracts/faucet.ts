import FaucetAbi from '@/lib/abi/Faucet.json';
import { configService } from '@/services/config/config.service';
import { web3Service } from '@/services/web3/web3.service';

export class Faucet {
  constructor(
    private readonly abi = FaucetAbi,
    private readonly config = configService,
    private readonly web3 = web3Service,
    public readonly address = config.network.addresses.faucet
  ) {
    if (!this.address) console.error('Faucet address not set');
  }

  /**
   * @summary Drip token from faucet
   */
  async drip(tokenAddress: string) {
    return await this.web3.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'drip',
      params: [tokenAddress],
    });
  }
}

export const faucet = new Faucet();
