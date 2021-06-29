import ConfigService from '../config/config.service';
import BlocknativeProvider from './providers/blocknative.provider';
import PolygonProvider from './providers/polygon.provider';

export default class GasPriceService {
  constructor(
    private readonly configService = new ConfigService(),
    private readonly blocknativeProvider = new BlocknativeProvider(),
    private readonly polygonProvider = new PolygonProvider()
  ) {}

  public async getLatest(): Promise<number | null> {
    switch (this.configService.network.key) {
      case '1':
        return await this.blocknativeProvider.getLatest();
      case '137':
        return await this.polygonProvider.getLatest();
      default:
        return null;
    }
  }
}
