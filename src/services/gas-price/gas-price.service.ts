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
import ArbitrumProvider from './providers/arbitrum.provider';
import GnosisProvider from './providers/gnosis.provider';

export const GAS_LIMIT_BUFFER = 0.1;

export class GasPriceService {
  constructor(
    private readonly configService = new ConfigService(),
    private readonly blocknativeProvider = new BlocknativeProvider(),
    private readonly polygonProvider = new PolygonProvider(),
    private readonly arbitrumProvider = new ArbitrumProvider(),
    private readonly gnosisProvider = new GnosisProvider()
  ) {}

  public async getGasPrice(): Promise<GasPrice | null> {
    switch (this.configService.network.key) {
      case '1':
        return await this.blocknativeProvider.getGasPrice();
      case '137':
        return await this.polygonProvider.getGasPrice();
      case '42161':
        return await this.arbitrumProvider.getGasPrice();
      case '100':
        return await this.gnosisProvider.getGasPrice();
      default:
        return null;
    }
  }

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
