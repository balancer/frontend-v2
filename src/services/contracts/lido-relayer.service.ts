import { LidoRelayer__factory } from '@balancer-labs/typechain';

import VaultService from '@/services/contracts/vault.service';

export default class LidoRelayerService extends VaultService {
  constructor() {
    super();
    this.abi = LidoRelayer__factory.abi;
  }

  get address() {
    return this.config.network.addresses.lidoRelayer;
  }
}

export const lidoRelayerService = new LidoRelayerService();
