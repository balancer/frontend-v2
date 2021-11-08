import { BigNumber } from '@ethersproject/bignumber';
import { Swap } from '@balancer-labs/sor/dist/types';
import { SwapV2 } from '@balancer-labs/sor2';
import SwapService, { SwapTokenType, SwapToken } from './swap.service';
import { configService } from '@/services/config/config.service';
import {
  FundManagement,
  SingleSwap,
  SwapKind
} from '@balancer-labs/balancer-js';

jest.mock('@/lib/utils/balancer/lido');
jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/services/contracts/exchange-proxy.service');
jest.mock('@/services/contracts/vault.service');
jest.mock('@/services/contracts/lido-relayer.service');
jest.mock('@/services/web3/web3.service');

describe('swap.service', () => {
  const tokens: Record<string, SwapToken> = {};
  let service;
  const PoolIdETHUSDC =
    '0x3a19030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004';
  const PoolIdETHstETH =
    '0xdad9030ed746bd1c3f2b0f996ff9479af04c5f0a000200000000000000000004';
  const PoolIdUSDCDAI =
    '6B15A01B5D46A5321B627BD7DEEF1AF57BC629070000000000000000000000D4';

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
    tokens.ETH = {
      address: configService.network.nativeAsset.address,
      amount: BigNumber.from(1e15),
      type: SwapTokenType.fixed
    };
    tokens.stETH = {
      address: configService.network.addresses.stETH,
      amount: BigNumber.from(2e15),
      type: SwapTokenType.fixed
    };
    tokens.wstETH = {
      address: configService.network.addresses.wstETH,
      amount: BigNumber.from(3e15),
      type: SwapTokenType.fixed
    };

    service = new SwapService();
  });

  it('Should initialize correctly', () => {
    expect(service).toBeTruthy();
  });

  describe('batchSwapV1', () => {
    let swaps: Swap[][] = [[]];

    beforeEach(() => {
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

    it('Should call exchange-proxy when swapping with exact inputs', async () => {
      tokens.USDC.type = SwapTokenType.fixed;
      tokens.DAI.type = SwapTokenType.min;
      await service.batchSwapV1(tokens.USDC, tokens.DAI, swaps);
      const exchangeProxyArgs = require('@/services/contracts/exchange-proxy.service')
        .exchangeProxyService.multihopBatchSwap.mock.calls[0];
      expect(exchangeProxyArgs[0]).toEqual(swaps);
      expect(exchangeProxyArgs[1]).toEqual(tokens.USDC);
      expect(exchangeProxyArgs[2]).toEqual(tokens.DAI);
      expect(exchangeProxyArgs[3]).toEqual({});
    });

    it('Should call exchange-proxy when swapping with exact outputs', async () => {
      tokens.USDC.type = SwapTokenType.max;
      tokens.DAI.type = SwapTokenType.fixed;
      await service.batchSwapV1(tokens.USDC, tokens.DAI, swaps);
      const exchangeProxyArgs = require('@/services/contracts/exchange-proxy.service')
        .exchangeProxyService.multihopBatchSwap.mock.calls[0];
      expect(exchangeProxyArgs[0]).toEqual(swaps);
      expect(exchangeProxyArgs[1]).toEqual(tokens.USDC);
      expect(exchangeProxyArgs[2]).toEqual(tokens.DAI);
      expect(exchangeProxyArgs[3]).toEqual({});
    });

    it('Should call exchange-proxy when swapping with exact outputs', async () => {
      tokens.ETH.type = SwapTokenType.fixed;
      tokens.USDC.type = SwapTokenType.min;
      swaps = [
        [
          {
            limitReturnAmount: '0',
            maxPrice:
              '115792089237316195423570985008687907853269984665640564039457584007913129639935',
            pool: PoolIdUSDCDAI,
            tokenIn: tokens.ETH.address,
            tokenOut: tokens.USDC.address
          }
        ]
      ];
      await service.batchSwapV1(tokens.ETH, tokens.USDC, swaps);
      const exchangeProxyArgs = require('@/services/contracts/exchange-proxy.service')
        .exchangeProxyService.multihopBatchSwap.mock.calls[0];
      expect(exchangeProxyArgs[0]).toEqual(swaps);
      expect(exchangeProxyArgs[1]).toEqual(tokens.ETH);
      expect(exchangeProxyArgs[2]).toEqual(tokens.USDC);
      expect(exchangeProxyArgs[3]).toEqual({
        value: `0x${tokens.ETH.amount.toHexString()}`
      });
    });

    it('Should return a rejected promise if exchange-proxy throws an error', () => {
      require('@/services/contracts/exchange-proxy.service').exchangeProxyService.multihopBatchSwap = jest
        .fn()
        .mockImplementation(() => {
          throw new Error('Failed to swap');
        });
      expect(
        service.batchSwapV1(tokens.USDC, tokens.DAI, swaps)
      ).rejects.toEqual('[Swapper] batchSwapV1 Error: Error: Failed to swap');
    });
  });

  describe('batchSwapV2', () => {
    let swaps: SwapV2[] = [];
    const amount = '1000000';
    const userAddress = '0xddd0c9C1b6C8537BeD0487C3fd64CF6140bd4ddd';
    let tokenAddresses;

    beforeEach(() => {
      tokenAddresses = [tokens.USDC.address, tokens.DAI.address];
      swaps = [
        {
          poolId: PoolIdUSDCDAI,
          amount: amount,
          assetInIndex: 0,
          assetOutIndex: 1,
          userData: ''
        }
      ];
      require('@/services/web3/web3.service').setUserAddress(userAddress);
    });

    describe('single swap', () => {
      it('Should call vault.swap when swapping a single token for another', async () => {
        tokens.USDC.type = SwapTokenType.fixed;
        tokens.DAI.type = SwapTokenType.min;
        await service.batchSwapV2(
          tokens.USDC,
          tokens.DAI,
          swaps,
          tokenAddresses
        );
        const vaultSwapArgs = require('@/services/contracts/vault.service')
          .vaultService.swap.mock.calls[0];
        const singleSwapArg: SingleSwap = vaultSwapArgs[0];
        expect(singleSwapArg.poolId).toEqual(PoolIdUSDCDAI);
        expect(singleSwapArg.kind).toEqual(SwapKind.GivenIn);
        expect(singleSwapArg.assetIn).toEqual(tokens.USDC.address);
        expect(singleSwapArg.assetOut).toEqual(tokens.DAI.address);
        expect(singleSwapArg.amount).toEqual(amount);
        expect(singleSwapArg.userData).toEqual('');

        const vaultSwapFundsArg: FundManagement = vaultSwapArgs[1];
        expect(vaultSwapFundsArg.sender).toEqual(userAddress);
        expect(vaultSwapFundsArg.recipient).toEqual(userAddress);
        expect(vaultSwapFundsArg.fromInternalBalance).toEqual(false);
        expect(vaultSwapFundsArg.toInternalBalance).toEqual(false);

        expect(vaultSwapArgs[2]).toEqual(tokens.DAI.amount.toString());
      });
    });

    describe('single swap lido', () => {
      it('Should call lido-relayer.swap when swapping a single token for another', async () => {
        tokens.ETH.type = SwapTokenType.fixed;
        tokens.stETH.type = SwapTokenType.min;
        swaps = [
          {
            poolId: PoolIdETHstETH,
            amount: amount,
            assetInIndex: 0,
            assetOutIndex: 1,
            userData: ''
          }
        ];
        await service.batchSwapV2(tokens.ETH, tokens.stETH, swaps, [
          tokens.ETH.address,
          tokens.wstETH.address // tokenAddresses currently contain wstETH even though tokenIn is stETH
        ]);
        const lidoRelayerSwapArgs = require('@/services/contracts/lido-relayer.service')
          .lidoRelayerService.swap.mock.calls[0];
        const singleSwapArg: SingleSwap = lidoRelayerSwapArgs[0];
        expect(singleSwapArg.poolId).toEqual(PoolIdETHstETH);
        expect(singleSwapArg.kind).toEqual(SwapKind.GivenIn);
        expect(singleSwapArg.assetIn).toEqual(tokens.ETH.address);
        expect(singleSwapArg.assetOut).toEqual(tokens.wstETH.address); 
        expect(singleSwapArg.amount).toEqual(amount);
        expect(singleSwapArg.userData).toEqual('');

        const fundsArg: FundManagement = lidoRelayerSwapArgs[1];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        expect(lidoRelayerSwapArgs[2]).toEqual(tokens.stETH.amount.toString());
      });
    });

    describe('multi swap', () => {
      beforeEach(() => {
        tokenAddresses = [
          tokens.ETH.address,
          tokens.USDC.address,
          tokens.DAI.address
        ];
        swaps = [
          {
            poolId: PoolIdETHUSDC,
            amount: amount,
            assetInIndex: 0,
            assetOutIndex: 1,
            userData: ''
          },
          {
            poolId: PoolIdUSDCDAI,
            amount: amount,
            assetInIndex: 1,
            assetOutIndex: 2,
            userData: ''
          }
        ];
      });

      it('Should call vault.batchSwap when swapping multiple tokens through multiple pools', async () => {
        tokens.USDC.type = SwapTokenType.fixed;
        tokens.DAI.type = SwapTokenType.min;
        await service.batchSwapV2(
          tokens.ETH,
          tokens.DAI,
          swaps,
          tokenAddresses
        );
        const vaultBatchSwapArgs = require('@/services/contracts/vault.service')
          .vaultService.batchSwap.mock.calls[0];
        expect(vaultBatchSwapArgs[0]).toEqual(SwapKind.GivenIn);
        expect(vaultBatchSwapArgs[1]).toEqual(swaps);
        expect(vaultBatchSwapArgs[2]).toEqual(tokenAddresses);

        const fundsArg: FundManagement = vaultBatchSwapArgs[3];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        const limitsArg: string[] = vaultBatchSwapArgs[4];
        expect(limitsArg[0]).toEqual(tokens.ETH.amount.toString());
        expect(limitsArg[1]).toEqual('0');
        expect(limitsArg[2]).toEqual(tokens.DAI.amount.mul(-1).toString());
      });

      it('Should return a rejected promise if vault throws an error', () => {
        const tokenAddresses = [
          tokens.ETH.address,
          tokens.USDC.address,
          tokens.DAI.address
        ];
        require('@/services/contracts/vault.service').vaultService.batchSwap = jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Failed to swap');
          });
        expect(
          service.batchSwapV2(tokens.ETH, tokens.DAI, swaps, tokenAddresses)
        ).rejects.toEqual('[Swapper] batchSwapV2 Error: Error: Failed to swap');
      });
    });

    describe('multi swap lido', () => {
      beforeEach(() => {
        tokenAddresses = [
          tokens.USDC.address,
          tokens.ETH.address,
          tokens.wstETH.address
        ];
        swaps = [
          {
            poolId: PoolIdETHUSDC,
            amount: amount,
            assetInIndex: 0,
            assetOutIndex: 1,
            userData: ''
          },
          {
            poolId: PoolIdETHstETH,
            amount: amount,
            assetInIndex: 1,
            assetOutIndex: 2,
            userData: ''
          }
        ];
      });

      it('Should call lido-relayer.batchSwap when swapping stETH', async () => {
        tokens.USDC.type = SwapTokenType.fixed;
        tokens.stETH.type = SwapTokenType.min;
        await service.batchSwapV2(
          tokens.USDC,
          tokens.stETH,
          swaps,
          tokenAddresses
        );
        const lidoBatchSwapArgs = require('@/services/contracts/lido-relayer.service')
          .lidoRelayerService.batchSwap.mock.calls[0];
        expect(lidoBatchSwapArgs[0]).toEqual(SwapKind.GivenIn);
        expect(lidoBatchSwapArgs[1]).toEqual(swaps);
        expect(lidoBatchSwapArgs[2]).toEqual(tokenAddresses);

        const fundsArg: FundManagement = lidoBatchSwapArgs[3];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        const limitsArg: string[] = lidoBatchSwapArgs[4];
        expect(limitsArg[0]).toEqual(tokens.USDC.amount.toString());
        expect(limitsArg[1]).toEqual('0');
        expect(limitsArg[2]).toEqual(tokens.stETH.amount.mul(-1).toString());
      });

      it('Should return a rejected promise if lido-relayer throws an error', () => {
        require('@/services/contracts/lido-relayer.service').lidoRelayerService.batchSwap = jest
          .fn()
          .mockImplementation(() => {
            throw new Error('Failed to swap');
          });
        expect(
          service.batchSwapV2(tokens.USDC, tokens.stETH, swaps, tokenAddresses)
        ).rejects.toEqual(
          '[Swapper] lidoBatchSwap Error: Error: Failed to swap'
        );
      });
    });
  });
});
