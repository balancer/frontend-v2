import axios from 'axios';
import { GasPrice } from './types';

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
      const price  =4;
      const maxPriorityFeePerGas = 4;

      return {
        price,
        maxPriorityFeePerGas,
      };
    } catch (error) {
      // console.log('[Arbitrum] Gas Platform Error', error);
      return null;
    }
  }

  private async fetchArbitrumProvider(method: string) {
    const { data } = await axios.post<ArbitrumGasStationResponse>(
      'https://arbitrum-mainnet.infura.io/v3/daaa68ec242643719749dd1caba2fc66',
      { method, id: 1, jsonrpc: '2.0' }
    );

    return data;
  }
}
