import { LidoRelayer__factory } from '@balancer-labs/typechain';
import { VaultService } from '@/services/contracts/vault.service';
import { configService } from '@/services/config/config.service';

export class LidoRelayerService extends VaultService {
  constructor() {
    super();
    this.abi = LidoRelayer__factory.abi;
  }

  get address() {
    return configService.network.addresses.lidoRelayer;
  }
}

export const lidoRelayerService = new LidoRelayerService();
