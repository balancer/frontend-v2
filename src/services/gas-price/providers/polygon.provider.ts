import axios from 'axios';

import { GWEI_UNIT } from '@/constants/units';

import { GasPrice } from './types';

type TxSpeedOptions = 'safeLow' | 'standard' | 'fast' | 'fast' | 'fastest';

interface PolygonGasStationResponse {
  safeLow: number;
  standard: number;
  fast: number;
  fastest: number;
  blockTime: number;
  blockNumber: number;
}

export default class PolygonProvider {
  public async getLatest(
    txSpeed: TxSpeedOptions = 'standard'
  ): Promise<GasPrice | null> {
    try {
      const { data } = await axios.get<PolygonGasStationResponse>(
        'https://gasstation-mainnet.matic.network'
      );
      return { price: data[txSpeed] * GWEI_UNIT };
    } catch (error) {
      console.log('[Polygon] Gas Platform Error', error);
      return null;
    }
  }
}
