import axios from 'axios';
import { GasPrice } from './types';
import { bnum } from '@/lib/utils';
import { configService } from '@/services/config/config.service';
import { Network } from '@/lib/config';

interface GnosisChainGasStationResponse {
  id: number;
  jsonrpc: string;
  result: string;
}

export default class GnosisChainProvider {
  public async getGasPrice(): Promise<GasPrice | null> {
    try {
      const [gasPrice, maxPriorityFee] = await Promise.all([
        this.fetchGnosisChainProvider('eth_gasPrice'),
        this.fetchGnosisChainProvider('eth_maxPriorityFeePerGas'),
      ]);
      const price = bnum(gasPrice.result).toNumber();
      const maxPriorityFeePerGas = bnum(maxPriorityFee.result).toNumber();

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      console.log('[Gnosis-chain] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchGnosisChainProvider(method: string) {
    const { data } = await axios.post<GnosisChainGasStationResponse>(
      configService.getNetworkRpc(Network.GNOSIS),
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
