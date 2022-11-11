import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@balancer-labs/sdk';

interface ArbitrumGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class ArbitrumProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchArbitrumProvider('eth_gasPrice'),
        this.fetchArbitrumProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Arbitrum] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchArbitrumProvider(method: string) {
    const { data } = await axios.post<ArbitrumGasStationResponse>(
      configService.getNetworkRpc(Network.ARBITRUM),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
