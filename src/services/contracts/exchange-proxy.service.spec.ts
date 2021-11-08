import { exchangeProxyService } from './exchange-proxy.service';
import { SwapToken, SwapTokenType } from '../swap/swap.service';
import { Swap } from '@balancer-labs/sor/dist/types';
import { BigNumber } from '@ethersproject/bignumber';

jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/services/web3/web3.service');

describe('exchange-proxy.service', () => {
  let swaps: Swap[][] = [[]];
  const tokens: Record<string, SwapToken> = {};

  beforeEach(() => {
    jest.clearAllMocks();
    tokens.USDC = {
      address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
      amount: BigNumber.from('1000000'),
      type: SwapTokenType.fixed
    };
    tokens.DAI = {
      address: '0x04df6e4121c27713ed22341e7c7df330f56f289b',
      amount: BigNumber.from('1000000'),
      type: SwapTokenType.min
    };
    swaps = [
      [
        {
          limitReturnAmount: '0',
          maxPrice:
            '115792089237316195423570985008687907853269984665640564039457584007913129639935',
          pool: '0x8e620e876ae87e26025810c651f42eab84c0b8f2',
          swapAmount: '1000000',
          tokenIn: tokens.USDC.address,
          tokenOut: tokens.DAI.address
        }
      ]
    ];
  });

  describe('multiHopBatchSwap', () => {
    it('Should error if minimum out or max in is not specified', () => {
      tokens.USDC.type = SwapTokenType.fixed;
      tokens.DAI.type = SwapTokenType.fixed;
      expect(
        exchangeProxyService.multihopBatchSwap(swaps, tokens.USDC, tokens.DAI)
      ).rejects.toEqual(
        'Invalid swap, must specify minimum out, or maximum in.'
      );
    });
  });

  describe('multihopBatchSwapExactIn', () => {
    it('Should call the contract with correct params', async () => {
      const totalAmountIn = '10';
      const minTotalAmountOut = '10';
      await exchangeProxyService.multihopBatchSwapExactIn(
        swaps,
        tokens.USDC.address,
        tokens.DAI.address,
        totalAmountIn,
        minTotalAmountOut
      );
      const sendTransactionArgs = require('@/services/web3/web3.service')
        .web3Service.sendTransaction.mock.calls[0];
      const transactionParams = sendTransactionArgs[3];
      expect(transactionParams[0]).toEqual(swaps);
      expect(transactionParams[1]).toEqual(tokens.USDC.address);
      expect(transactionParams[2]).toEqual(tokens.DAI.address);
      expect(transactionParams[3]).toEqual(totalAmountIn);
      expect(transactionParams[4]).toEqual(minTotalAmountOut);
    });
  });

  describe('multihopBatchSwapExactOut', () => {
    it('Should call the contract with correct params', async () => {
      const maxTotalAmountIn = '10';
      await exchangeProxyService.multihopBatchSwapExactOut(
        swaps,
        tokens.USDC.address,
        tokens.DAI.address,
        maxTotalAmountIn
      );
      const sendTransactionArgs = require('@/services/web3/web3.service')
        .web3Service.sendTransaction.mock.calls[0];
      const transactionParams = sendTransactionArgs[3];
      expect(transactionParams[0]).toEqual(swaps);
      expect(transactionParams[1]).toEqual(tokens.USDC.address);
      expect(transactionParams[2]).toEqual(tokens.DAI.address);
      expect(transactionParams[3]).toEqual(maxTotalAmountIn);
    });
  });
});
