import { Contract } from '@ethersproject/contracts';

import {
  EthereumTxType,
  ethereumTxType,
} from '@/composables/useEthereumTxType';

import ConfigService from '../config/config.service';
import BlocknativeProvider from './providers/blocknative.provider';
import PolygonProvider from './providers/polygon.provider';
import { GasPrice, GasSettings } from './providers/types';
import { JsonRpcSigner, TransactionRequest } from '@ethersproject/providers';

const USE_BLOCKNATIVE_GAS_PLATFORM =
  process.env.VUE_APP_USE_BLOCKNATIVE_GAS_PLATFORM === 'false' ? false : true;
export const GAS_LIMIT_BUFFER = 0.1;

export class GasPriceService {
  constructor(
    private readonly configService = new ConfigService(),
    private readonly blocknativeProvider = new BlocknativeProvider(),
    private readonly polygonProvider = new PolygonProvider()
  ) {}

  public async getGasPrice(): Promise<GasPrice | null> {
    switch (this.configService.network.key) {
      case '1':
        return await this.blocknativeProvider.getGasPrice();
      case '137':
        return await this.polygonProvider.getGasPrice();
      default:
        return null;
    }
  }

  public async settings(
    signer: JsonRpcSigner,
    options: TransactionRequest,
    forceLegacyTxType = false
  ): Promise<GasSettings> {
    let gasSettings: GasSettings = {};

    const gasLimit = await signer.estimateGas(options);
    gasSettings.gasLimit = this.formatGasLimit(gasLimit.toNumber());

    if (this.shouldSetGasPriceSettings(options)) {
      gasSettings = await this.setGasPriceSettings(
        gasSettings,
        forceLegacyTxType
      );
    }

    return gasSettings;
  }

  public async settingsForContractCall(
    contractWithSigner: Contract,
    action: string,
    params: any[],
    options: Record<string, any>,
    forceLegacyTxType = false
  ): Promise<GasSettings> {
    let gasSettings: GasSettings = {};

    const gasLimit = await contractWithSigner.estimateGas[action](
      ...params,
      options
    );
    gasSettings.gasLimit = this.formatGasLimit(gasLimit.toNumber());

    if (this.shouldSetGasPriceSettings(options)) {
      gasSettings = await this.setGasPriceSettings(
        gasSettings,
        forceLegacyTxType
      );
    }

    return gasSettings;
  }

  private formatGasLimit(limit: number): number {
    return Math.floor(limit * (1 + GAS_LIMIT_BUFFER));
  }

  private shouldSetGasPriceSettings(options: Record<string, any>): boolean {
    return (
      USE_BLOCKNATIVE_GAS_PLATFORM &&
      options.gasPrice == null &&
      options.maxFeePerGas == null &&
      options.maxPriorityFeePerGas == null
    );
  }

  private async setGasPriceSettings(
    gasSettings: GasSettings,
    forceLegacyTxType: boolean
  ): Promise<GasSettings> {
    const gasPrice = await this.getGasPrice();
    if (gasPrice != null) {
      if (
        ethereumTxType.value === EthereumTxType.EIP1559 &&
        gasPrice.maxFeePerGas != null &&
        gasPrice.maxPriorityFeePerGas != null &&
        !forceLegacyTxType
      ) {
        gasSettings.maxFeePerGas = gasPrice.maxFeePerGas;
        gasSettings.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;
      } else {
        gasSettings.gasPrice = gasPrice.price;
      }
    }
    return gasSettings;
  }
}

export const gasPriceService = new GasPriceService();
