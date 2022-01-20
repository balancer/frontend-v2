import { bnum } from '@/lib/utils';
import axios from 'axios';
import { Pool } from '../balancer/subgraph/types';
import ConfigService, { configService } from '../config/config.service';

type LidoAPRs = {
  eth: string;
  steth: string;
};

type ApiResponse = {
  data: LidoAPRs;
};

export default class LidoService {
  wethAddress: string;
  wstEthAddress: string;

  constructor(readonly config: ConfigService = configService) {
    this.wethAddress = config.network.addresses.weth;
    this.wstEthAddress = config.network.addresses.wstETH;
  }

  async getStEthAPR(): Promise<string> {
    try {
      const {
        data: { data: aprs }
      } = await axios.get<ApiResponse>('https://stake.lido.fi/api/apr');
      return bnum(aprs.steth)
        .div(100)
        .toString();
    } catch (error) {
      console.error('Failed to fetch stETH APR:', error);
      return '0';
    }
  }

  async calcStEthAPRFor(
    pool: Pool,
    protocolFeePercentage: number
  ): Promise<string> {
    const stethAPR = await this.getStEthAPR();
    const wethBalance =
      pool.tokens.find(t => t.address === this.wethAddress)?.balance || '0';
    const wstethBalance =
      pool.tokens.find(t => t.address === this.wstEthAddress)?.balance || '0';
    const totalBalance = bnum(wethBalance).plus(wstethBalance);
    const wstethRatio = bnum(wstethBalance).div(totalBalance);

    return bnum(stethAPR)
      .times(1 - protocolFeePercentage)
      .times(wstethRatio)
      .toString();
  }
}

export const lidoService = new LidoService();
