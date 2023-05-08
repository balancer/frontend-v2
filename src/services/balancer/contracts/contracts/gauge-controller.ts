import { getUnixTime } from 'date-fns';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { mapValues } from 'lodash';

import GaugeControllerAbi from '@/lib/abi/GaugeController.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { getOldMulticaller } from '@/dependencies/OldMulticaller';

export class GaugeController {
  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = GaugeControllerAbi,
    private readonly config = configService,
    private readonly walletService = walletServiceInstance
  ) {}

  async getRelativeWeights(gaugeAddresses: string[], timestamp: number) {
    const multicaller = this.getMulticaller();
    for (const gaugeAddress of gaugeAddresses) {
      multicaller.call(
        getAddress(gaugeAddress),
        this.address,
        'gauge_relative_weight(address, uint256)',
        [getAddress(gaugeAddress), timestamp || getUnixTime(new Date())]
      );
    }
    const result = await multicaller.execute();
    const weights = mapValues(result, weight => formatUnits(weight, 18));
    return weights;
  }

  private getMulticaller() {
    const Multicaller = getOldMulticaller();
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
