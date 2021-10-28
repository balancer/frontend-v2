import { Web3Provider } from '@ethersproject/providers';
import { AddressZero } from '@ethersproject/constants';
import { TokenWeight } from '@/composables/pools/usePoolCreation';
import { poolCreator } from './pool-creator.service';
import BigNumber from 'bignumber.js';

const tokens: Record<string, TokenWeight> = {};

const mockPoolId =
  'EEE8292CB20A443BA1CAAA59C985CE14CA2BDEE5000100000000000000000263';

jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/lib/utils/balancer/web3');
jest.mock('@ethersproject/contracts', () => {
  const Contract = jest.fn().mockImplementation(() => {
    return {
      getPoolId: jest.fn().mockImplementation(() => mockPoolId)
    };
  });
  return {
    Contract
  };
});

describe('PoolCreator', () => {
  beforeEach(() => {
    tokens.MKR = {
      tokenAddress: '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
      weight: 70,
      isLocked: false,
      id: 0
    };
    tokens.WETH = {
      tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      weight: 20,
      isLocked: false,
      id: 1
    };
    tokens.USDT = {
      tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      weight: 10,
      isLocked: false,
      id: 2
    };
  });

  describe('createWeightedPool', () => {
    const mockPoolAddress = '0xEEE8292cb20a443ba1caaa59c985ce14ca2bdee5';

    let poolDetails;
    const mockPoolName = 'TestPool';
    const mockPoolSymbol = '50WETH-50USDT';
    const mockSwapFee = '0.01';
    const mockOwner = AddressZero;

    beforeEach(async () => {
      require('@/lib/utils/balancer/web3').__setMockPoolAddress(
        mockPoolAddress
      );
      const mockProvider = {} as Web3Provider;
      tokens.WETH.weight = 50;
      tokens.USDT.weight = 50;
      poolDetails = await poolCreator.createWeightedPool(
        mockProvider,
        mockPoolName,
        mockPoolSymbol,
        mockSwapFee,
        [tokens.WETH, tokens.USDT],
        mockOwner
      );
    });

    it('Should call sendTransaction with the correct information', () => {
      const sendTransactionArgs = require('@/lib/utils/balancer/web3')
        .sendTransaction.mock.calls[0];
      expect(sendTransactionArgs[3]).toEqual('create');
      const sendTransactionParams = sendTransactionArgs[4];
      expect(sendTransactionParams[0]).toEqual(mockPoolName);
      expect(sendTransactionParams[1]).toEqual(mockPoolSymbol);
      expect(sendTransactionParams[2]).toEqual([
        tokens.WETH.tokenAddress,
        tokens.USDT.tokenAddress
      ]);
      expect(sendTransactionParams[3]).toEqual([
        new BigNumber(tokens.WETH.weight).multipliedBy(1e16).toString(),
        new BigNumber(tokens.USDT.weight).multipliedBy(1e16).toString()
      ]);
      expect(sendTransactionParams[4]).toEqual(
        new BigNumber(mockSwapFee).multipliedBy(1e16).toString()
      );
      expect(sendTransactionParams[5]).toEqual(mockOwner);
    });

    it('Should return pool id and address correctly', () => {
      expect(poolDetails.id).toEqual(mockPoolId);
      expect(poolDetails.address).toEqual(mockPoolAddress);
    });
  });

  describe('sortTokens', () => {
    it('Should sort tokens by their address', () => {
      const unsortedTokens: TokenWeight[] = [
        tokens.WETH,
        tokens.MKR,
        tokens.USDT
      ];

      const sortedTokens = poolCreator.sortTokens(unsortedTokens);
      expect(sortedTokens).toEqual([tokens.MKR, tokens.WETH, tokens.USDT]);
    });
  });

  describe('calculateTokenWeights', () => {
    it('Should return 50e16/50e16 for 2 Token happy case. ', () => {
      tokens.MKR.weight = 50;
      tokens.WETH.weight = 50;
      const normalizedWeights: string[] = poolCreator.calculateTokenWeights([
        tokens.MKR,
        tokens.WETH
      ]);
      expect(normalizedWeights[0]).toEqual(new BigNumber(0.5e18).toString());
      expect(normalizedWeights[1]).toEqual(new BigNumber(0.5e18).toString());
    });

    it('Should return weights that add up to exactly 1e18', () => {
      tokens.MKR.weight = 33.33;
      tokens.WETH.weight = 33.33;
      tokens.USDT.weight = 33.33;
      const normalizedWeights: string[] = poolCreator.calculateTokenWeights([
        tokens.MKR,
        tokens.WETH,
        tokens.USDT
      ]);
      expect(normalizedWeights[0]).toEqual('333333333333333333');
      expect(normalizedWeights[1]).toEqual('333333333333333333');
      expect(normalizedWeights[2]).toEqual('333333333333333334');
    });
  });
});
