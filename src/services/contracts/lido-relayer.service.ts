import { LidoRelayer__factory } from '@balancer-labs/typechain';
import configs from '@/lib/config';
import { VaultService } from './vault.service';

export class LidoRelayerService extends VaultService {
  constructor() {
    super();
    this.address = configs[this.network].addresses.lidoRelayer;
    this.abi = LidoRelayer__factory.abi;
    this.initializeContract();
  }
}

export const lidoRelayerService = new LidoRelayerService();
