import axios from 'axios';

import { GWEI_UNIT } from '@/constants/units';

import { GasPrice } from './types';

type BlocknativeGasPriceConfidence = 70 | 80 | 90 | 95 | 99;

type BlocknativeEstimatedPrice = {
  confidence: BlocknativeGasPriceConfidence;
  price: number;
  maxPriorityFeePerGas: number;
  maxFeePerGas: number;
};

type BlocknativeBlockPrice = {
  blockNumber: number;
  estimatedTransactionCount: number;
  estimatedPrices: BlocknativeEstimatedPrice[];
};

type BlocknativeGasPlatformResponse = {
  unit: string;
  currentBlockNumber: number;
  maxPrice: number;
  msSinceLastBlock: number;
  network: string;
  system: string;
  blockPrices: [BlocknativeBlockPrice];
};

export default class BlocknativeProvider {
  public async getGasPrice(
    confidence: BlocknativeGasPriceConfidence | 'best' = 'best'
  ): Promise<GasPrice | null> {
    try {
      const response = await axios.get<BlocknativeGasPlatformResponse>(
        'https://api.blocknative.com/gasprices/blockprices',
        {
          headers: {
            Authorization: process.env.VUE_APP_BLOCKNATIVE_DAPP_ID,
          },
        }
      );
      const estimatedPrices = response.data.blockPrices[0].estimatedPrices;

      let gasPrice: BlocknativeEstimatedPrice | undefined;

      // try to get 90% confidence, but make sure not to overpay. (otherwise grab 70%)
      if (confidence === 'best') {
        const gasPrice70 = estimatedPrices.find(
          estimatedPrice => estimatedPrice.confidence === 70
        );
        const gasPrice90 = estimatedPrices.find(
          estimatedPrice => estimatedPrice.confidence === 90
        );

        if (gasPrice70 != null && gasPrice90 != null) {
          gasPrice =
            gasPrice90.price > 1.25 * gasPrice70.price
              ? gasPrice70
              : gasPrice90;
        }
      } else {
        gasPrice = estimatedPrices.find(
          estimatedPrice => estimatedPrice.confidence === confidence
        );
      }

      // gas price is in gwei
      if (gasPrice != null) {
        return {
          price: Math.round(gasPrice.price * GWEI_UNIT),
          maxFeePerGas: Math.round(gasPrice.maxFeePerGas * GWEI_UNIT),
          maxPriorityFeePerGas: Math.round(
            gasPrice.maxPriorityFeePerGas * GWEI_UNIT
          ),
        };
      }
    } catch (e) {
      console.log('[Blocknative] Gas Platform Error', e);
    }
    return null;
  }
}
