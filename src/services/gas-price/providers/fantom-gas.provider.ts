import axios from 'axios';

import { GasPriceEstimation } from './types';

interface FantomGasStationResponse {
  result: {
    LastBlock: string;
    SafeGasPrice: string;
    ProposeGasPrice: string;
    FastGasPrice: string;
    UsdPrice: string; //fantom price
  };
}

export default class FantomGasProvider {
  public async getGasPriceEstimation(): Promise<GasPriceEstimation | null> {
    try {
      const { data } = await axios.get<FantomGasStationResponse>(
        'https://gftm.blockscan.com/gasapi.ashx?apikey=key&method=gasoracle'
      );

      return {
        pricePerGwei: parseFloat(data.result.UsdPrice) / 1_000_000_000,
        standardPriceGwei: parseInt(data.result.SafeGasPrice),
        fastPriceGwei: parseInt(data.result.ProposeGasPrice),
        rapidPriceGwei: parseInt(data.result.FastGasPrice)
      };
    } catch (error) {
      console.log('[Fantom] Gas Tracker Error', error);
      return null;
    }
  }
}
