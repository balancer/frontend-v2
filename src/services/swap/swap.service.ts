import { Web3Provider } from "@ethersproject/providers";
import BigNumber from "bignumber.js";

interface SwapToken {
  address: string;
  amount?: BigNumber;
  amountMin?: BigNumber;
  amountMax?: BigNumber;
}

export default class SwapService {

  public setNetwork(network: string) {

  }

  public setProvider(provider: Web3Provider) {

  }

  public batchSwapV1(tokenIn: SwapToken, tokenOut: SwapToken, swaps: Swap[][]) {

  }


  public batchSwapV2(tokenIn: SwapToken, tokenOut: SwapToken, swaps: SwapV2[], tokenAddresses: string[]) {

  }

}