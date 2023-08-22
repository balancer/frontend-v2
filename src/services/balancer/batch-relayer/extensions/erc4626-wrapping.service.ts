import { Interface } from '@ethersproject/abi';
import Erc4626WrappingAbi from '../abi/Erc4626Wrapping.json';
import {
  EncodeUnwrapErc4626Input,
  EncodeWrapErc4626Input,
} from '../relayer-types';

export class Erc4626WrappingService {
  public encodeWrap(params: EncodeWrapErc4626Input): string {
    const erc4626WrappingLibrary = new Interface(Erc4626WrappingAbi);

    return erc4626WrappingLibrary.encodeFunctionData('wrapERC4626', [
      params.wrappedToken,
      params.sender,
      params.recipient,
      params.amount,
      params.outputReference,
    ]);
  }

  public encodeUnwrap(params: EncodeUnwrapErc4626Input): string {
    const erc4626WrappingLibrary = new Interface(Erc4626WrappingAbi);

    return erc4626WrappingLibrary.encodeFunctionData('unwrapERC4626', [
      params.wrappedToken,
      params.sender,
      params.recipient,
      params.amount,
      params.outputReference,
    ]);
  }
}
