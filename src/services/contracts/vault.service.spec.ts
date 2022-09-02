import {
  FundManagement,
  SingleSwap,
  SwapType,
  SwapV2,
} from '@balancer-labs/sdk';
import { BigNumber } from '@ethersproject/bignumber';
import { MaxUint256 } from '@ethersproject/constants';

import { SwapToken, SwapTokenType } from '../swap/swap.service';
import { vaultService } from './vault.service';

jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/services/web3/web3.service');

const userAddress = '0xAAA00fB39c06E7b41bEdFf8A6a4e013666141d40';

describe('vault.service', () => {
  let swaps: SwapV2[] = [];
  const tokens: Record<string, SwapToken> = {};
  const poolId =
    'AAAF4E2F1E7A1B8B9D09D2F2739AC6753F5BA5CB00020000000000000000031A';
  const funds: FundManagement = {
    sender: userAddress,
    recipient: userAddress,
    fromInternalBalance: false,
    toInternalBalance: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    tokens.USDC = {
      address: '0xc2569dd7d0fd715b054fbf16e75b001e5c0c1115',
      amount: BigNumber.from('1000000'),
      type: SwapTokenType.fixed,
    };
    tokens.DAI = {
      address: '0x04df6e4121c27713ed22341e7c7df330f56f289b',
      amount: BigNumber.from('1000000'),
      type: SwapTokenType.min,
    };
    swaps = [
      {
        poolId: poolId,
        amount: '1000000',
        assetInIndex: 0,
        assetOutIndex: 1,
        userData: '',
      },
    ];
  });

  describe('swap', () => {
    it('Should call the contract with correct params', async () => {
      const single: SingleSwap = {
        poolId,
        amount: '10',
        assetIn: tokens.USDC.address,
        assetOut: tokens.DAI.address,
        kind: SwapType.SwapExactIn,
        userData: '',
      };
      const tokenOutAmount = '10';

      await vaultService.swap(single, funds, tokenOutAmount);
      const sendTransactionArgs = require('@/services/web3/web3.service')
        .web3Service.txBuilder.contract.sendTransaction.mock.calls[0];
      expect(sendTransactionArgs[0]).toEqual({
        contractAddress: vaultService.address,
        abi: vaultService.abi,
        action: 'swap',
        params: [single, funds, tokenOutAmount, MaxUint256],
        options: {},
      });
    });
  });

  describe('batchSwap', () => {
    it('Should call the contract with correct params', async () => {
      const swapKind = SwapType.SwapExactIn;
      const tokenAddresses = [tokens.USDC.address, tokens.DAI.address];
      const limits = ['10', '10'];
      await vaultService.batchSwap(
        swapKind,
        swaps,
        tokenAddresses,
        funds,
        limits
      );
      const sendTransactionArgs = require('@/services/web3/web3.service')
        .web3Service.txBuilder.contract.sendTransaction.mock.calls[0];
      expect(sendTransactionArgs[0]).toEqual({
        contractAddress: vaultService.address,
        abi: vaultService.abi,
        action: 'batchSwap',
        params: [swapKind, swaps, tokenAddresses, funds, limits, MaxUint256],
        options: {},
      });
    });
  });
});
