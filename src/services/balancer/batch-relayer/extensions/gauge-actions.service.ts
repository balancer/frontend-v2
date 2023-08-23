import { Interface } from '@ethersproject/abi';
import GaugeActionsAbi from '../abi/GaugeActions.json';
import { EncodeGaugeDepositInput } from '../relayer-types';

export class GaugeActionsService {
  public encodeDeposit(params: EncodeGaugeDepositInput): string {
    const gaugeActionsLibrary = new Interface(GaugeActionsAbi);

    return gaugeActionsLibrary.encodeFunctionData('gaugeDeposit', [
      params.gauge,
      params.sender,
      params.recipient,
      params.amount,
    ]);
  }

  public encodeWithdraw(params: EncodeGaugeDepositInput): string {
    const gaugeActionsLibrary = new Interface(GaugeActionsAbi);

    return gaugeActionsLibrary.encodeFunctionData('gaugeWithdraw', [
      params.gauge,
      params.sender,
      params.recipient,
      params.amount,
    ]);
  }
}
