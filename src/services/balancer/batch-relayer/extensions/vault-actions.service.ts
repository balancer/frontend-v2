import { Interface } from '@ethersproject/abi';
import VaultActionsAbi from '../abi/VaultActions.json';
import {
  EncodeBatchSwapInput,
  EncodeExitPoolInput,
  EncodeJoinPoolInput,
  ExitPoolData,
} from '../relayer-types';
import { ExitPoolRequest } from '@balancer-labs/sdk';

export class VaultActionsService {
  public encodeBatchSwap(params: EncodeBatchSwapInput): string {
    const relayerLibrary = new Interface(VaultActionsAbi);

    return relayerLibrary.encodeFunctionData('batchSwap', [
      params.swapType,
      params.swaps,
      params.assets,
      params.funds,
      params.limits,
      params.deadline,
      params.value,
      params.outputReferences,
    ]);
  }

  public encodeExitPool(params: EncodeExitPoolInput): string {
    const relayerLibrary = new Interface(VaultActionsAbi);

    return relayerLibrary.encodeFunctionData('exitPool', [
      params.poolId,
      params.poolKind,
      params.sender,
      params.recipient,
      params.exitPoolRequest,
      params.outputReferences,
    ]);
  }

  public encodeJoinPool(params: EncodeJoinPoolInput): string {
    const relayerLibrary = new Interface(VaultActionsAbi);

    return relayerLibrary.encodeFunctionData('joinPool', [
      params.poolId,
      params.poolKind,
      params.sender,
      params.recipient,
      params.joinPoolRequest,
      params.value,
      params.outputReference,
    ]);
  }

  public constructExitCall(params: ExitPoolData): string {
    const {
      assets,
      minAmountsOut,
      userData,
      toInternalBalance,
      poolId,
      poolKind,
      sender,
      recipient,
      outputReferences,
    } = params;

    const exitPoolRequest: ExitPoolRequest = {
      assets,
      minAmountsOut,
      userData,
      toInternalBalance,
    };

    const exitPoolInput: EncodeExitPoolInput = {
      poolId,
      poolKind,
      sender,
      recipient,
      outputReferences,
      exitPoolRequest,
    };

    return this.encodeExitPool(exitPoolInput);
  }
}
