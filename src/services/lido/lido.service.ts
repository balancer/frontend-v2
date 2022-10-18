import axios from 'axios';

import { TOKENS } from '@/constants/tokens';
import { bnum, isSameAddress } from '@/lib/utils';

import ConfigService, { configService } from '../config/config.service';
import { Pool } from '../pool/types';

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
    this.wethAddress = TOKENS.Addresses.WETH;
    this.wstEthAddress = config.network.addresses.wstETH;
  }

  async getStEthAPR(): Promise<string> {
    try {
      const {
        data: { data: aprs },
      } = await axios.get<ApiResponse>('https://stake.lido.fi/api/apr');
      return bnum(aprs.steth).div(100).toString();
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
      pool.tokens.find(t => isSameAddress(t.address, this.wethAddress))
        ?.balance || '0';
    const wstethBalance =
      pool.tokens.find(t => isSameAddress(t.address, this.wstEthAddress))
        ?.balance || '0';
    const totalBalance = bnum(wethBalance).plus(wstethBalance);
    const wstethRatio =
      pool.tokens.find(t => isSameAddress(t.address, this.wstEthAddress))
        ?.weight || bnum(wstethBalance).div(totalBalance);

    return bnum(stethAPR)
      .times(1 - protocolFeePercentage) // TODO: check pool type and use protocol yield percentage cache when applicable
      .times(wstethRatio)
      .toString();
  }
}

export const lidoService = new LidoService();
