import GaugeCheckpointerAbi from '@/lib/abi/GaugeCheckpointer.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner } from '@ethersproject/providers';

export class GaugeCheckpointer {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = GaugeCheckpointerAbi,
    private readonly walletService = walletServiceInstance
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  public async checkpoint(payload: {
    signer: JsonRpcSigner;
    poolIds: string[];
  }) {
    const { poolIds, signer } = payload;
    const txBuilder = new TransactionBuilder(signer);

    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'multicall',
      params: [poolIds],
    });
  }
}
