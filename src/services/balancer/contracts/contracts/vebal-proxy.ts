import { Contract } from '@ethersproject/contracts';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { mapValues } from 'lodash';

import veBalProxyABI from '@/lib/abi/veDelegationProxy.json';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { web3Service } from '@/services/web3/web3.service';

export class VeBALProxy {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = veBalProxyABI,
    private readonly config = configService,
    private readonly web3 = web3Service
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  async getAdjustedBalance(address: string) {
    const balance = await this.instance.adjustedBalanceOf(getAddress(address));
    return formatUnits(balance, 18);
  }

  async getAdjustedBalances(addresses: string) {
    const multicaller = this.getMulticaller();
    for (const address of addresses) {
      multicaller.call(address, this.address, 'adjustedBalanceOf', [
        getAddress(address),
      ]);
    }

    const response = await multicaller.execute();
    return mapValues(response, balance => formatUnits(balance || '0', 18));
  }

  private getMulticaller(): Multicaller {
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
