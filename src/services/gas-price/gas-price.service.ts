import { Contract } from '@ethersproject/contracts';
import ConfigService from '../config/config.service';
import BlocknativeProvider from './providers/blocknative.provider';
import PolygonProvider from './providers/polygon.provider';
import { GasPrice, GasSettings } from './providers/types';
import {
  EthereumTxType,
  ethereumTxType
} from '@/composables/useEthereumTxType';

const USE_BLOCKNATIVE_GAS_PLATFORM =
  process.env.VUE_APP_USE_BLOCKNATIVE_GAS_PLATFORM === 'false' ? false : true;
const GAS_LIMIT_BUFFER = 0.1;

export default class GasPriceService {
  constructor(
    private readonly configService = new ConfigService(),
    private readonly blocknativeProvider = new BlocknativeProvider(),
    private readonly polygonProvider = new PolygonProvider()
  ) {}

  public async getLatest(): Promise<GasPrice | null> {
    switch (this.configService.network.key) {
      case '1':
        return await this.blocknativeProvider.getLatest();
      case '137':
        return await this.polygonProvider.getLatest();
      default:
        return null;
    }
  }

  public async getGasSettingsForContractCall(
    contractWithSigner: Contract,
    action: string,
    params: any[],
    options: Record<string, any>,
    forceEthereumLegacyTxType = false
  ): Promise<GasSettings> {
    const gasLimitNumber = await contractWithSigner.estimateGas[action](
      ...params,
      options
    );

    const gasSettings: GasSettings = {};

    const gasLimit = gasLimitNumber.toNumber();
    gasSettings.gasLimit = Math.floor(gasLimit * (1 + GAS_LIMIT_BUFFER));

    if (
      USE_BLOCKNATIVE_GAS_PLATFORM &&
      options.gasPrice == null &&
      options.maxFeePerGas == null &&
      options.maxPriorityFeePerGas == null
    ) {
      const gasPrice = await this.getLatest();
      if (gasPrice != null) {
        if (
          ethereumTxType.value === EthereumTxType.EIP1559 &&
          options.maxFeePerGas != null &&
          options.maxPriorityFeePerGas != null &&
          !forceEthereumLegacyTxType
        ) {
          gasSettings.maxFeePerGas = gasPrice.maxFeePerGas;
          gasSettings.maxPriorityFeePerGas = gasPrice.maxPriorityFeePerGas;
        } else {
          gasSettings.gasPrice = gasPrice.price;
        }
      }
    }
    return gasSettings;
  }
}

export const gasPriceService = new GasPriceService();
