import {
  FundManagement,
  SingleSwap,
  SwapType,
  SwapV2,
} from '@balancer-labs/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { AddressZero } from '@ethersproject/constants';

import { configService } from '@/services/config/config.service';

import SwapService, { SwapToken, SwapTokenType } from './swap.service';

jest.mock('@/lib/utils/balancer/lido');
jest.mock('@/services/rpc-provider/rpc-provider.service');
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
    jest.spyOn(console, 'log').mockImplementation();
    jest.clearAllMocks();
    require('@/services/contracts/vault.service').vaultService.batchSwap = jest
      .fn()
      .mockImplementation();
    tokens.USDC = {
      address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
      amount: BigNumber.from('1000000'),
      type: SwapTokenType.fixed,
    };
    tokens.USDT = {
      address: '0xcC08220af469192C53295fDd34CFb8DF29aa17AB',
      amount: BigNumber.from('1000000'),
      type: SwapTokenType.fixed,
    };
    tokens.DAI = {
      address: '0x04df6e4121c27713ed22341e7c7df330f56f289b',
      amount: BigNumber.from('1000000'),
      type: SwapTokenType.min,
    };
    tokens.ETH = {
      address: configService.network.nativeAsset.address,
      amount: BigNumber.from(1e15),
      type: SwapTokenType.fixed,
    };
    tokens.ETHv2 = {
      // With v2 swaps the ETH address is set to 0x0
      address: AddressZero,
      amount: BigNumber.from(1.2e15),
      type: SwapTokenType.fixed,
    };
    tokens.stETH = {
      address: configService.network.addresses.stETH,
      amount: BigNumber.from(2e15),
      type: SwapTokenType.fixed,
    };
    tokens.wstETH = {
      address: configService.network.addresses.wstETH,
      amount: BigNumber.from(3e15),
      type: SwapTokenType.fixed,
    };

    service = new SwapService();
  });

  it('Should initialize correctly', () => {
    expect(service).toBeTruthy();
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
          userData: '',
        },
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
        expect(singleSwapArg.kind).toEqual(SwapType.SwapExactIn);
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

      it('Should set options.value to tokenIn.amount when swapping a native asset', async () => {
        tokens.ETHv2.type = SwapTokenType.fixed;
        tokens.DAI.type = SwapTokenType.min;
        tokenAddresses = [tokens.ETHv2.address, tokens.DAI.address];
        await service.batchSwapV2(
          tokens.ETHv2,
          tokens.DAI,
          swaps,
          tokenAddresses
        );
        const vaultSwapArgs = require('@/services/contracts/vault.service')
          .vaultService.swap.mock.calls[0];
        const singleSwapArg: SingleSwap = vaultSwapArgs[0];
        expect(singleSwapArg.poolId).toEqual(PoolIdUSDCDAI);
        expect(singleSwapArg.kind).toEqual(SwapType.SwapExactIn);
        expect(singleSwapArg.assetIn).toEqual(tokens.ETHv2.address);
        expect(singleSwapArg.assetOut).toEqual(tokens.DAI.address);
        expect(singleSwapArg.amount).toEqual(amount);
        expect(singleSwapArg.userData).toEqual('');

        const vaultSwapFundsArg: FundManagement = vaultSwapArgs[1];
        expect(vaultSwapFundsArg.sender).toEqual(userAddress);
        expect(vaultSwapFundsArg.recipient).toEqual(userAddress);
        expect(vaultSwapFundsArg.fromInternalBalance).toEqual(false);
        expect(vaultSwapFundsArg.toInternalBalance).toEqual(false);

        expect(vaultSwapArgs[2]).toEqual(tokens.DAI.amount.toString());
        expect(vaultSwapArgs[3]).toEqual({ value: tokens.ETHv2.amount });
      });
    });

    describe('single swap lido', () => {
      it('Should call lido-relayer.swap when swapping a single token for another', async () => {
        tokens.ETHv2.type = SwapTokenType.fixed;
        tokens.stETH.type = SwapTokenType.min;
        swaps = [
          {
            poolId: PoolIdETHstETH,
            amount: amount,
            assetInIndex: 0,
            assetOutIndex: 1,
            userData: '',
          },
        ];
        await service.batchSwapV2(tokens.ETHv2, tokens.stETH, swaps, [
          tokens.ETHv2.address,
          tokens.wstETH.address, // tokenAddresses currently contain wstETH even though tokenIn is stETH
        ]);
        const lidoRelayerSwapArgs =
          require('@/services/contracts/lido-relayer.service')
            .lidoRelayerService.swap.mock.calls[0];
        const singleSwapArg: SingleSwap = lidoRelayerSwapArgs[0];
        expect(singleSwapArg.poolId).toEqual(PoolIdETHstETH);
        expect(singleSwapArg.kind).toEqual(SwapType.SwapExactIn);
        expect(singleSwapArg.assetIn).toEqual(tokens.ETHv2.address);
        expect(singleSwapArg.assetOut).toEqual(tokens.wstETH.address);
        expect(singleSwapArg.amount).toEqual(amount);
        expect(singleSwapArg.userData).toEqual('');

        const fundsArg: FundManagement = lidoRelayerSwapArgs[1];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        expect(lidoRelayerSwapArgs[2]).toEqual(tokens.stETH.amount.toString());
        expect(lidoRelayerSwapArgs[3]).toEqual({ value: tokens.ETHv2.amount });
      });
    });

    describe('multi swap', () => {
      beforeEach(() => {
        tokenAddresses = [
          tokens.ETHv2.address,
          tokens.USDC.address,
          tokens.DAI.address,
        ];
        swaps = [
          {
            poolId: PoolIdETHUSDC,
            amount: amount,
            assetInIndex: 0,
            assetOutIndex: 1,
            userData: '',
          },
          {
            poolId: PoolIdUSDCDAI,
            amount: amount,
            assetInIndex: 1,
            assetOutIndex: 2,
            userData: '',
          },
        ];
      });

      it('Should call vault.batchSwap when swapping multiple tokens through multiple pools', async () => {
        tokens.ETHv2.type = SwapTokenType.fixed;
        tokens.DAI.type = SwapTokenType.min;
        await service.batchSwapV2(
          tokens.ETHv2,
          tokens.DAI,
          swaps,
          tokenAddresses
        );
        const vaultBatchSwapArgs = require('@/services/contracts/vault.service')
          .vaultService.batchSwap.mock.calls[0];
        expect(vaultBatchSwapArgs[0]).toEqual(SwapType.SwapExactIn);
        expect(vaultBatchSwapArgs[1]).toEqual(swaps);
        expect(vaultBatchSwapArgs[2]).toEqual(tokenAddresses);

        const fundsArg: FundManagement = vaultBatchSwapArgs[3];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        const limitsArg: string[] = vaultBatchSwapArgs[4];
        expect(limitsArg[0]).toEqual(tokens.ETHv2.amount.toString());
        expect(limitsArg[1]).toEqual('0');
        expect(limitsArg[2]).toEqual(tokens.DAI.amount.mul(-1).toString());

        expect(vaultBatchSwapArgs[5]).toEqual({ value: tokens.ETHv2.amount });
      });

      it('Should return a rejected promise if vault throws an error', async () => {
        const tokenAddresses = [
          tokens.ETH.address,
          tokens.USDC.address,
          tokens.DAI.address,
        ];
        require('@/services/contracts/vault.service').vaultService.batchSwap =
          jest.fn().mockImplementation(() => {
            throw new Error('Failed to swap');
          });
        await expect(
          service.batchSwapV2(tokens.ETH, tokens.DAI, swaps, tokenAddresses)
        ).rejects.toThrow('Failed to swap');
      });
    });

    describe('multi swap lido', () => {
      beforeEach(() => {
        tokenAddresses = [
          tokens.USDC.address,
          tokens.ETHv2.address,
          tokens.wstETH.address,
        ];
        swaps = [
          {
            poolId: PoolIdETHUSDC,
            amount: amount,
            assetInIndex: 0,
            assetOutIndex: 1,
            userData: '',
          },
          {
            poolId: PoolIdETHstETH,
            amount: amount,
            assetInIndex: 1,
            assetOutIndex: 2,
            userData: '',
          },
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
        const lidoBatchSwapArgs =
          require('@/services/contracts/lido-relayer.service')
            .lidoRelayerService.batchSwap.mock.calls[0];
        expect(lidoBatchSwapArgs[0]).toEqual(SwapType.SwapExactIn);
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

      it('Should pass overrides.value when swapping ETH for stETH', async () => {
        tokens.ETHv2.type = SwapTokenType.fixed;
        tokens.stETH.type = SwapTokenType.min;
        tokenAddresses = [
          tokens.ETHv2.address,
          tokens.USDC.address,
          tokens.wstETH.address,
        ];
        await service.batchSwapV2(
          tokens.ETHv2,
          tokens.stETH,
          swaps,
          tokenAddresses
        );
        const lidoBatchSwapArgs =
          require('@/services/contracts/lido-relayer.service')
            .lidoRelayerService.batchSwap.mock.calls[0];
        expect(lidoBatchSwapArgs[0]).toEqual(SwapType.SwapExactIn);
        expect(lidoBatchSwapArgs[1]).toEqual(swaps);
        expect(lidoBatchSwapArgs[2]).toEqual(tokenAddresses);

        const fundsArg: FundManagement = lidoBatchSwapArgs[3];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        const limitsArg: string[] = lidoBatchSwapArgs[4];
        expect(limitsArg[0]).toEqual(tokens.ETHv2.amount.toString());
        expect(limitsArg[1]).toEqual('0');
        expect(limitsArg[2]).toEqual(tokens.stETH.amount.mul(-1).toString());

        expect(lidoBatchSwapArgs[5]).toEqual({ value: tokens.ETHv2.amount });
      });

      it('Should return a rejected promise if lido-relayer throws an error', async () => {
        require('@/services/contracts/lido-relayer.service').lidoRelayerService.batchSwap =
          jest.fn().mockImplementation(() => {
            throw new Error('Failed to swap');
          });
        await expect(
          service.batchSwapV2(tokens.USDC, tokens.stETH, swaps, tokenAddresses)
        ).rejects.toThrow('Failed to swap');
      });
    });
  });

  describe('boostedPools', () => {
    let swaps: SwapV2[] = [];
    const userAddress = '0xddd0c9C1b6C8537BeD0487C3fd64CF6140bd4ddd';
    let tokenAddresses;

    const PoolIdBBAUSDC =
      '0x0bbd32b14a6503ee20f87df38cf2d5d3b59ea2f50000000000000000000004d6';
    const PoolIdBBAUSD =
      '0x8fd162f338b770f7e879030830cde9173367f3010000000000000000000004d8';
    const PoolIdBBAUSDT =
      '0xe667d48618e71c2a02e4a1b66ed9def1426938b60000000000000000000004d7';
    const PoolIdBBADAI =
      '0xfcccb77a946b6a3bd59d149f083b5bfbb8004d6d0000000000000000000004d5';

    beforeEach(() => {
      tokens.bbaUSD = {
        address: '0x8fd162f338b770f7e879030830cde9173367f301',
        amount: BigNumber.from('0'),
        type: SwapTokenType.fixed,
      };
      tokens.USDC = {
        address: '0xe22da380ee6b445bb8273c81944adeb6e8450422',
        amount: BigNumber.from('300000000'),
        type: SwapTokenType.fixed,
      };
      tokens.bbaUSDC = {
        address: '0x0bbd32b14a6503ee20f87df38cf2d5d3b59ea2f5',
        amount: BigNumber.from('0'),
        type: SwapTokenType.fixed,
      };
      tokens.USDT = {
        address: '0x13512979ade267ab5100878e2e0f485b568328a4',
        amount: BigNumber.from('400000000'),
        type: SwapTokenType.fixed,
      };
      tokens.bbaUSDT = {
        address: '0xe667d48618e71c2a02e4a1b66ed9def1426938b6',
        amount: BigNumber.from('0'),
        type: SwapTokenType.fixed,
      };
      tokens.DAI = {
        address: '0xff795577d9ac8bd7d90ee22b6c1703490b6512fd',
        amount: BigNumber.from('500000000000000000000'),
        type: SwapTokenType.min,
      };
      tokens.bbaDAI = {
        address: '0xfcccb77a946b6a3bd59d149f083b5bfbb8004d6d',
        amount: BigNumber.from('0'),
        type: SwapTokenType.fixed,
      };

      require('@/services/web3/web3.service').setUserAddress(userAddress);
    });

    describe('boostedJoinBatchSwap', () => {
      beforeEach(() => {
        tokenAddresses = [
          tokens.USDC.address,
          tokens.bbaUSDC.address,
          tokens.bbaUSD.address,
          tokens.USDT.address,
          tokens.bbaUSDT.address,
          tokens.DAI.address,
          tokens.bbaDAI.address,
        ];
        swaps = [
          {
            poolId: PoolIdBBAUSDC,
            assetInIndex: 0,
            assetOutIndex: 1,
            amount: tokens.USDC.amount.toString(),
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSD,
            assetInIndex: 1,
            assetOutIndex: 2,
            amount: tokens.bbaUSD.amount.toString(),
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSDT,
            assetInIndex: 3,
            assetOutIndex: 4,
            amount: tokens.USDT.amount.toString(),
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSD,
            assetInIndex: 4,
            assetOutIndex: 2,
            amount: '0',
            userData: '0x',
          },
          {
            poolId: PoolIdBBADAI,
            assetInIndex: 5,
            assetOutIndex: 6,
            amount: tokens.DAI.amount.toString(),
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSD,
            assetInIndex: 6,
            assetOutIndex: 2,
            amount: '0',
            userData: '0x',
          },
        ];
      });

      it('Should call vault.batchSwap when joining a boosted pool', async () => {
        tokens.USDC.type = SwapTokenType.fixed;
        tokens.DAI.type = SwapTokenType.min;
        await service.boostedJoinBatchSwap(
          [tokens.USDC, tokens.USDT, tokens.DAI],
          tokens.bbaUSD,
          swaps,
          tokenAddresses
        );
        const vaultBatchSwapArgs = require('@/services/contracts/vault.service')
          .vaultService.batchSwap.mock.calls[0];
        expect(vaultBatchSwapArgs[0]).toEqual(SwapType.SwapExactIn);
        expect(vaultBatchSwapArgs[1]).toEqual(swaps);
        expect(vaultBatchSwapArgs[2]).toEqual(tokenAddresses);

        const fundsArg: FundManagement = vaultBatchSwapArgs[3];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        const limitsArg: string[] = vaultBatchSwapArgs[4];
        expect(limitsArg[0]).toEqual(tokens.USDC.amount.toString());
        expect(limitsArg[1]).toEqual('0');
        expect(limitsArg[2]).toEqual(tokens.bbaUSD.amount.mul(-1).toString());
        expect(limitsArg[3]).toEqual(tokens.USDT.amount.toString());
        expect(limitsArg[4]).toEqual('0');
        expect(limitsArg[5]).toEqual(tokens.DAI.amount.toString());
        expect(limitsArg[6]).toEqual('0');
      });
    });

    describe('boostedExitBatchSwap', () => {
      beforeEach(() => {
        tokenAddresses = [
          tokens.bbaUSD.address,
          tokens.bbaUSDC.address,
          tokens.USDC.address,
          tokens.bbaUSDT.address,
          tokens.USDT.address,
          tokens.bbaDAI.address,
          tokens.DAI.address,
        ];
        swaps = [
          {
            poolId: PoolIdBBAUSD,
            assetInIndex: 0,
            assetOutIndex: 1,
            amount: tokens.USDC.amount.toString(),
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSDC,
            assetInIndex: 1,
            assetOutIndex: 2,
            amount: '0',
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSD,
            assetInIndex: 0,
            assetOutIndex: 3,
            amount: tokens.USDT.amount.toString(),
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSDT,
            assetInIndex: 3,
            assetOutIndex: 4,
            amount: '0',
            userData: '0x',
          },
          {
            poolId: PoolIdBBAUSD,
            assetInIndex: 0,
            assetOutIndex: 5,
            amount: tokens.DAI.amount.toString(),
            userData: '0x',
          },
          {
            poolId: PoolIdBBADAI,
            assetInIndex: 5,
            assetOutIndex: 6,
            amount: '0',
            userData: '0x',
          },
        ];
      });

      it('Should call vault.batchSwap when swapping multiple tokens through multiple pools', async () => {
        tokens.USDC.type = SwapTokenType.fixed;
        tokens.DAI.type = SwapTokenType.min;
        await service.boostedExitBatchSwap(
          tokens.bbaUSD,
          [tokens.USDC, tokens.USDT, tokens.DAI],
          swaps,
          tokenAddresses,
          SwapType.SwapExactIn
        );
        const vaultBatchSwapArgs = require('@/services/contracts/vault.service')
          .vaultService.batchSwap.mock.calls[0];
        expect(vaultBatchSwapArgs[0]).toEqual(SwapType.SwapExactIn);
        expect(vaultBatchSwapArgs[1]).toEqual(swaps);
        expect(vaultBatchSwapArgs[2]).toEqual(tokenAddresses);

        const fundsArg: FundManagement = vaultBatchSwapArgs[3];
        expect(fundsArg.sender).toEqual(userAddress);
        expect(fundsArg.recipient).toEqual(userAddress);
        expect(fundsArg.fromInternalBalance).toEqual(false);
        expect(fundsArg.toInternalBalance).toEqual(false);

        const limitsArg: string[] = vaultBatchSwapArgs[4];
        expect(limitsArg[0]).toEqual(tokens.bbaUSD.amount.toString());
        expect(limitsArg[1]).toEqual('0');
        expect(limitsArg[2]).toEqual(tokens.USDC.amount.mul(-1).toString());
        expect(limitsArg[3]).toEqual('0');
        expect(limitsArg[4]).toEqual(tokens.USDT.amount.mul(-1).toString());
        expect(limitsArg[5]).toEqual('0');
        expect(limitsArg[6]).toEqual(tokens.DAI.amount.mul(-1).toString());
      });

      /**
       * THIS TEST IS FAILING due to boostedTokenAddresses being treated
       * as an object instead of an array.
       */
      // it('Should return a rejected promise if vault throws an error', async () => {
      //   const boostedTokenAddresses = [
      //     tokens.USDC.address,
      //     tokens.USDT.address,
      //     tokens.DAI.address
      //   ];
      //   require('@/services/contracts/vault.service').vaultService.batchSwap = jest
      //     .fn()
      //     .mockImplementation(() => {
      //       throw new Error('Failed to swap');
      //     });
      //   await expect(
      //     service.boostedExitBatchSwap(
      //       swaps,
      //       boostedTokenAddresses,
      //       tokens.bbaUSD.address,
      //       tokens.bbaUSD.amount,
      //       {
      //         [tokens.USDC.address]: tokens.USDC.amount.toString(),
      //         [tokens.USDT.address]: tokens.USDT.amount.toString(),
      //         [tokens.DAI.address]: tokens.DAI.amount.toString()
      //       },
      //       SwapKind.GivenIn
      //     )
      //   ).rejects.toThrow('Failed to swap');
      // });
    });
  });
});
