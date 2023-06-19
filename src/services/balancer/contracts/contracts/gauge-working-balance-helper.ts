import GaugeWorkingBalanceHelperAbi from '@/lib/abi/GaugeWorkingBalanceHelper.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';
import { Gauge } from '../../gauges/types';

export class GaugeWorkingBalanceHelper {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = GaugeWorkingBalanceHelperAbi,
    private readonly walletService = walletServiceInstance
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  async getWorkingBalanceToSupplyRatios(payload: {
    gauge: Gauge;
    userAddress: string;
    signer: JsonRpcSigner;
  }) {
    const { signer, gauge, userAddress } = payload;
    const txBuilder = new TransactionBuilder(signer);

    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'getWorkingBalanceToSupplyRatios',
      params: [gauge, userAddress],
    });
  }
}
