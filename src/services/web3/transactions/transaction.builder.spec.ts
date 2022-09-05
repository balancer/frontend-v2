import { AddressZero } from '@ethersproject/constants';
import { JsonRpcSigner } from '@ethersproject/providers';
import { Contract } from 'ethers';
import { ContractConcern } from './concerns/contract.concern';
import { RawConcern } from './concerns/raw.concern';
import { TransactionBuilder } from './transaction.builder';

jest.mock('@ethersproject/providers');
jest.mock('@/services/rpc-provider/rpc-provider.service');
jest.mock('@/services/gas-price/gas-price.service', () => {
  return {
    gasPriceService: {
      settings: jest.fn().mockReturnValue({
        gasLimit: 1e5,
      }),
      settingsForContractCall: jest.fn().mockReturnValue({
        gasLimit: 1e5,
      }),
    },
  };
});
jest.mock('ethers', () => {
  return {
    Contract: jest.fn().mockImplementation(() => {
      return {
        test: jest.fn().mockImplementation(),
      };
    }),
  };
});

const SignerMock = JsonRpcSigner as jest.Mocked<typeof JsonRpcSigner>;

describe('TransactionBuilder', () => {
  let signer;

  beforeAll(() => {
    signer = new SignerMock('0x00', 'provider' as any);
  });

  beforeEach(() => {
    jest.spyOn(console, 'log').mockImplementation();
  });

  it('Instantiates given signer', () => {
    const txBuilder = new TransactionBuilder(signer);
    expect(txBuilder).toBeTruthy();
  });

  it('Instatiates a contract concern class', () => {
    const txBuilder = new TransactionBuilder(signer);
    expect(txBuilder.contract).toBeTruthy();
    expect(txBuilder.contract).toBeInstanceOf(ContractConcern);
  });

  it('Instantiates a raw concern class', () => {
    const txBuilder = new TransactionBuilder(signer);
    expect(txBuilder.raw).toBeTruthy();
    expect(txBuilder.raw).toBeInstanceOf(RawConcern);
  });

  describe('Contract concern', () => {
    it('It calls given contract with params and options', async () => {
      const txBuilder = new TransactionBuilder(signer);
      await txBuilder.contract.sendTransaction({
        contractAddress: AddressZero,
        abi: ['function test(uint256 amount) public'],
        action: 'test',
        params: [1e18],
      });

      // @ts-ignore
      const contractMock = Contract.mock.results[0].value;

      expect(contractMock.test).toBeCalledWith(1e18, {
        gasLimit: 1e5,
      });
    });
  });

  describe('Raw concern', () => {
    it('It calls sendTransaction for signer', async () => {
      const options = {
        to: AddressZero,
        data: 'test',
      };
      const txBuilder = new TransactionBuilder(signer);
      await txBuilder.raw.sendTransaction(options);
      options['gasLimit'] = 1e5;

      expect(signer.sendTransaction).toBeCalledWith(options);
    });
  });
});
