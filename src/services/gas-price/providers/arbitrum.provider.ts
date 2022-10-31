import axios from 'axios';
import { GasPrice } from './types';
import { configService } from '@/services/config/config.service';
import { bnum } from '@/lib/utils';

interface ArbitrumGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class ArbitrumProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchArbutrumProvider('eth_gasPrice'),
        this.fetchArbutrumProvider('eth_maxPriorityFeePerGas'),
      ]);

      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();
      console.log('price', price);
      console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);
      return {
        price,
        // maxFeePerGas: Math.floor(data[txSpeed].maxFee * GWEI_UNIT),
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Arbitrum] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchArbutrumProvider(method: string) {
    const { data } = await axios.post<ArbitrumGasStationResponse>(
      configService.loggingRpc,
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
