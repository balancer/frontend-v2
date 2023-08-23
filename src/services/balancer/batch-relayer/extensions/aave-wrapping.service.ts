import { Interface } from '@ethersproject/abi';
import aaveWrappingAbi from '../abi/AaveWrapping.json';
import { EncodeUnwrapAaveStaticTokenInput } from '../relayer-types';

export class AaveWrappingService {
  public encodeUnwrap(params: EncodeUnwrapAaveStaticTokenInput): string {
    const aaveWrappingLibrary = new Interface(aaveWrappingAbi);

    return aaveWrappingLibrary.encodeFunctionData('unwrapAaveStaticToken', [
      params.staticToken,
      params.sender,
      params.recipient,
      params.amount,
      params.toUnderlying,
      params.outputReference,
    ]);
  }
}
