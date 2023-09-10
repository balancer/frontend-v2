import GaugeCheckpointerAbi from '@/lib/abi/GaugeCheckpointer.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner } from '@ethersproject/providers';

export class GaugeCheckpointer {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = GaugeCheckpointerAbi
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  public async checkpoint(payload: {
    signer: JsonRpcSigner;
    userAddress: string;
    gauges: string[];
  }) {
    const { gauges, signer, userAddress } = payload;
    const txBuilder = new TransactionBuilder(signer);

    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'gaugeCheckpoint',
      params: [userAddress, gauges],
    });
  }
}
