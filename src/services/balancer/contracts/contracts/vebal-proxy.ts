import {
  EthersContract,
  getEthersContract,
} from '@/dependencies/EthersContract';
import { getAddress } from '@ethersproject/address';
import { formatUnits } from '@ethersproject/units';
import { mapValues } from 'lodash';

import veBalProxyABI from '@/lib/abi/veDelegationProxy.json';
import { configService } from '@/services/config/config.service';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { getOldMulticaller } from '@/dependencies/OldMulticaller';
import veBalProxyABIL2 from '@/lib/abi/veDelegationProxyL2.json';
import { networkId } from '@/composables/useNetwork';
import { Network } from '@/lib/config/types';

export class VeBALProxy {
  instance: EthersContract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = networkId.value === Network.MAINNET
      ? veBalProxyABI
      : veBalProxyABIL2,
    private readonly config = configService,
    private readonly walletService = walletServiceInstance
  ) {
    const Contract = getEthersContract();
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  async getAdjustedBalance(address: string) {
    const balance = await this.instance.adjustedBalanceOf(getAddress(address));
    return formatUnits(balance, 18);
  }

  async getVeBalTotalSupplyL2() {
    const totalSupply = await this.instance.totalSupply();
    return formatUnits(totalSupply, 18);
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

  private getMulticaller() {
    const Multicaller = getOldMulticaller();
    return new Multicaller(this.config.network.key, this.provider, this.abi);
  }
}
