import OmniVotingEscrowAbi from '@/lib/abi/OmniVotingEscrow.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

export class OmniVotingEscrow {
  instance: Contract;

  constructor(
    public readonly address: string,
    private readonly provider = rpcProviderService.jsonProvider,
    private readonly abi = OmniVotingEscrowAbi,
    private readonly walletService = walletServiceInstance
  ) {
    this.instance = new Contract(this.address, this.abi, this.provider);
  }

  async estimateSendUserBalance(signer: JsonRpcSigner, chainId: number) {
    const txBuilder = new TransactionBuilder(signer);
    return await txBuilder.contract.callStatic<any>({
      contractAddress: this.address,
      abi: this.abi,
      action: 'estimateSendUserBalance',
      params: [chainId],
    });
  }

  public async sendUserBalance(payload: {
    signer: JsonRpcSigner;
    userAddress: string;
    chainId: number;
    nativeFee: BigNumber;
  }) {
    const { userAddress, chainId, nativeFee, signer } = payload;
    const txBuilder = new TransactionBuilder(signer);

    return await txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'sendUserBalance',
      params: [userAddress, chainId, userAddress],
      options: {
        value: nativeFee,
      },
    });
  }
}
