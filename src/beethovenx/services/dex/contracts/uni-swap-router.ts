import Service from '@/services/balancer/contracts/balancer-contracts.service';
import ConfigService from '@/services/config/config.service';
import { Multicaller } from '@/lib/utils/balancer/contract';
import { default as UniswapV2Router02 } from '@/beethovenx/abi/UniswapV2Router02.json';
import { BigNumber } from 'bignumber.js';
import { GetAmountsOutInput } from '@/beethovenx/services/dex/dex-contract-types';

export default class UniSwapRouter {
  private readonly service: Service;

  constructor(
    service,
    private readonly routerAddress: string,
    private readonly configService = new ConfigService()
  ) {
    this.service = service;
    this.routerAddress = routerAddress;
  }

  public async getAmountsOut(
    inputs: GetAmountsOutInput[]
  ): Promise<BigNumber[]> {
    const multicaller = new Multicaller(
      this.configService.network.key,
      this.service.provider,
      UniswapV2Router02
    );

    for (let i = 0; i < inputs.length; i++) {
      multicaller.call(
        `getAmountsOut${i}`,
        this.routerAddress,
        'getAmountsOut',
        [inputs[i].amountIn.toString(), inputs[i].path]
      );
    }

    const result = await multicaller.execute();
    const output: BigNumber[] = [];

    for (let i = 0; i < inputs.length; i++) {
      //`getAmountsOut${i}`
      output.push(
        result[`getAmountsOut${i}`][result[`getAmountsOut${i}`].length - 1]
      );
    }

    return output;
  }
}
