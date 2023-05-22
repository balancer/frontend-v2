import OmniVotingEscrowAbi from '@/lib/abi/OmniVotingEscrow.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { Contract } from '@ethersproject/contracts';

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

  async estimateSendUserBalance(chainId: number) {
    return await this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'estimateSendUserBalance',
      params: [chainId, false, []],
    });
  }

  public async sendUserBalance(chainId: number) {
    return await this.walletService.txBuilder.contract.sendTransaction({
      contractAddress: this.address,
      abi: this.abi,
      action: 'sendUserBalance',
      params: [chainId, false, []],
    });
  }
}
