import ConfigService from '../config/config.service';
import BlocknativeProvider from './providers/blocknative.provider';
import PolygonProvider from './providers/polygon.provider';
import { GasPrice, GasPriceEstimation } from './providers/types';
import FantomGasProvider from '@/services/gas-price/providers/fantom-gas.provider';

export default class GasPriceService {
  constructor(
    private readonly configService = new ConfigService(),
    private readonly blocknativeProvider = new BlocknativeProvider(),
    private readonly polygonProvider = new PolygonProvider(),
    private readonly fantomProvider = new FantomGasProvider()
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

  public async getGasPriceEstimation(): Promise<GasPriceEstimation | null> {
    switch (this.configService.network.key) {
      case '250':
        return await this.fantomProvider.getGasPriceEstimation();
      default:
        return null;
    }
  }
}
