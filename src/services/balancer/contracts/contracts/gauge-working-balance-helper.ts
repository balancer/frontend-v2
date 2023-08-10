import GaugeWorkingBalanceHelperAbi from '@/lib/abi/GaugeWorkingBalanceHelper.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';
import { TransactionBuilder } from '@/services/web3/transactions/transaction.builder';

import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { Contract } from '@ethersproject/contracts';
import { JsonRpcSigner } from '@ethersproject/providers';
import { BigNumber } from 'ethers';

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
    gauge: string;
    userAddress: string;
    signer: JsonRpcSigner;
  }) {
    try {
      const { signer, gauge, userAddress } = payload;
      const txBuilder = new TransactionBuilder(signer);

      return await txBuilder.contract.callStatic<[BigNumber, BigNumber]>({
        contractAddress: this.address,
        abi: this.abi,
        action: 'getWorkingBalanceToSupplyRatios',
        params: [gauge, userAddress],
      });
    } catch (e: any) {
      const reason = e.reason;

      const revertedReasonMsg =
        /missing revert data in call exception; Transaction reverted without a reason string/;

      if (!reason || revertedReasonMsg.test(reason)) {
        // ignore here as most likely this is the old gauge error
        return;
      }

      throw e;
    }
  }
}
