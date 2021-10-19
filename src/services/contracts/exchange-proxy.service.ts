import exchangeProxyAbi from '@/lib/abi/ExchangeProxy.json';
import configs from '@/lib/config';
import { SwapToken } from '../swap/swap.service';
import { Swap } from '@balancer-labs/sor/dist/types';
import { TransactionResponse } from '@ethersproject/abstract-provider';
import { Web3Provider } from '@ethersproject/providers';
import { Contract } from '@ethersproject/contracts';
import useWeb3 from '@/services/web3/useWeb3';

export default class ExchangeProxyService {
  network: string;
  provider: Web3Provider;
  address: string;
  abi: any;
  signer: any;
  contract: any;
  contractWithSigner: any;

  constructor() {
    this.network = 'homestead';
    this.address = configs[this.network].addresses.exchangeProxy;
    this.abi = exchangeProxyAbi;
    const { getProvider } = useWeb3();
    this.provider = getProvider();
    this.signer = this.provider.getSigner();
    this.contract = new Contract(this.address, this.abi, this.provider);
    this.contractWithSigner = this.contract.connect(this.signer);
  }

  public async multihopBatchSwap(
    swaps: Swap[][],
    tokenIn: SwapToken,
    tokenOut: SwapToken
  ) : Promise<TransactionResponse> {
    if (tokenIn.amount && tokenOut.amountMin) {
      return this.multihopBatchSwapExactIn(
        swaps,
        tokenIn.address,
        tokenOut.address,
        tokenIn.amount.toString(),
        tokenOut.amountMin.toString()
      );
    }

    if (tokenIn.amountMax) {
      return this.multihopBatchSwapExactOut(
        swaps,
        tokenIn.address,
        tokenOut.address,
        tokenIn.amountMax.toString()
      );
    }

    return Promise.reject(new Error("Invalid swap, must specify minimum out, or maximum in."));
  }

  public async multihopBatchSwapExactIn(
    swaps: Swap[][],
    tokenIn: string,
    tokenOut: string,
    tokenInAmount: string,
    tokenOutAmountMin: string
  ) : Promise<TransactionResponse> {

    // Get gas overrides

    return this.contractWithSigner.multihopBatchSwapExactIn(
      swaps,
      tokenIn,
      tokenOut,
      tokenInAmount,
      tokenOutAmountMin
    );
  }

  public async multihopBatchSwapExactOut(
    swaps: Swap[][],
    tokenIn: string,
    tokenOut: string,
    tokenInAmountMax: string
  ) : Promise<TransactionResponse> {

    // Get gas overrides

    return this.contractWithSigner.multihopBatchSwapExactOut(
      swaps,
      tokenIn,
      tokenOut,
      tokenInAmountMax
    );
  }
}

export const exchangeProxyService = new ExchangeProxyService();
