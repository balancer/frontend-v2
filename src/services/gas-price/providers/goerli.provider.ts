import axios from 'axios';
import { GWEI_UNIT } from '@/constants/units';
import { GasPrice } from './types';

type TxSpeedOptions = 'safeLow' | 'standard' | 'fast' | 'fast' | 'fastest';

type GoerliEstimatedPrice = { maxPriorityFee: number; maxFee: number };

interface GoerliGasStationResponse {
  blockNumber: number;
  blockTime: number;
  estimatedBaseFee: number;
  fast: GoerliEstimatedPrice;
  safeLow: GoerliEstimatedPrice;
  standard: GoerliEstimatedPrice;
}

export default class PolygonProvider {
  public async getGasPrice(
    txSpeed: TxSpeedOptions = 'standard'
  ): Promise<GasPrice | null> {
    try {
      const { data } = await axios.get<GoerliGasStationResponse>(
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
      console.log('[Goerli] Gas Platform Error', error);
      return null;
    }
  }
}
