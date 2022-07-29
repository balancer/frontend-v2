import { formatUnits } from '@ethersproject/units';
import { Contract } from 'ethers';

import { TOKENS } from '@/constants/tokens';
import StablePhantomAbi from '@/lib/abi/StablePhantomPool.json';
import { rpcProviderService } from '@/services/rpc-provider/rpc-provider.service';

export class BBAUSDToken {
  constructor(
    private readonly abi = StablePhantomAbi,
    public readonly address = TOKENS.Addresses.bbaUSD,
    private readonly provider = rpcProviderService.jsonProvider
  ) {}

  /**
   * @summary Instantiates a contract instance for the bb-a-USD token.
   * @returns Ethers Contract instance
   */
  public getInstance(): Contract {
    if (!this.address) throw new Error('No bb-a-USD address');
    return new Contract(this.address, this.abi, this.provider);
  }

  /**
   * @description This function returns the appreciation of one BPT relative to the underlying tokens.
   * This starts at 1 when the pool is created and grows over time. Because of preminted BPT, it uses `
   * getVirtualSupply` instead of `totalSupply`.
   */
  public async getRate(): Promise<string> {
    const instance = this.getInstance();
    const rate = await instance.getRate();

    return formatUnits(rate, 18);
  }
}

export const bbAUSDToken = new BBAUSDToken();
