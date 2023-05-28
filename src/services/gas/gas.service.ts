import { Contract } from '@ethersproject/contracts';
import { GasSettings } from './types';
import { JsonRpcSigner, TransactionRequest } from '@ethersproject/providers';

export const GAS_LIMIT_BUFFER = 0.1;

export class GasService {
  public async settings(
    signer: JsonRpcSigner,
    options: TransactionRequest
  ): Promise<GasSettings> {
    const gasSettings: GasSettings = {};

    const gasLimit = await signer.estimateGas(options);
    gasSettings.gasLimit = this.formatGasLimit(gasLimit.toNumber());

    return gasSettings;
  }

  public async settingsForContractCall(
    contractWithSigner: Contract,
    action: string,
    params: any[],
    options: Record<string, any>
  ): Promise<GasSettings> {
    const gasSettings: GasSettings = {};

    const gasLimit = await contractWithSigner.estimateGas[action](
      ...params,
      options
    );
    gasSettings.gasLimit = this.formatGasLimit(gasLimit.toNumber());

    return gasSettings;
  }

  private formatGasLimit(limit: number): number {
    return Math.floor(limit * (1 + GAS_LIMIT_BUFFER));
  }
}

export const gasService = new GasService();
