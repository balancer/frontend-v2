import axios from 'axios';

import { GWEI_UNIT } from '@/constants/units';

import { GasPrice } from './types';

type TxSpeedOptions = 'safeLow' | 'standard' | 'fast' | 'fast' | 'fastest';

type PolygonEstimatedPrice = { maxPriorityFee: number; maxFee: number };

interface PolygonGasStationResponse {
  blockNumber: number;
  blockTime: number;
  estimatedBaseFee: number;
  fast: PolygonEstimatedPrice;
  safeLow: PolygonEstimatedPrice;
  standard: PolygonEstimatedPrice;
}

export default class PolygonProvider {
  public async getGasPrice(
    txSpeed: TxSpeedOptions = 'standard'
  ): Promise<GasPrice | null> {
    try {
      const { data } = await axios.get<PolygonGasStationResponse>(
        'https://gasstation-mainnet.matic.network/v2'
      );
      return {
        price: Math.floor(data[txSpeed].maxFee * GWEI_UNIT),
        maxFeePerGas: Math.floor(data[txSpeed].maxFee * GWEI_UNIT),
        maxPriorityFeePerGas: Math.floor(
          data[txSpeed].maxPriorityFee * GWEI_UNIT
        ),
      };
    } catch (error) {
      console.log('[Polygon] Gas Platform Error', error);
      return null;
    }
  }
}
