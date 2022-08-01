import {
  InvestmentPool__factory,
  StablePool__factory,
  WeightedPool__factory,
} from '@balancer-labs/typechain';

import ERC20_ABI from '@/lib/abi/ERC20.json';
import IERC4626 from '@/lib/abi/IERC4626.json';
import LinearPoolAbi from '@/lib/abi/LinearPool.json';
import StablePhantomPool from '@/lib/abi/StablePhantomPool.json';
import StaticATokenLMAbi from '@/lib/abi/StaticATokenLM.json';
import { Multicaller } from '@/lib/utils/balancer/contract';

import { configService } from '../config/config.service';
import { rpcProviderService } from '../rpc-provider/rpc-provider.service';

const ERC20ABIs = Object.values(
  Object.fromEntries(
    [
      ...WeightedPool__factory.abi,
      ...StablePool__factory.abi,
      ...InvestmentPool__factory.abi,
      ...StablePhantomPool,
      ...LinearPoolAbi,
      ...StaticATokenLMAbi,
      ...ERC20_ABI,
      ...IERC4626,
    ].map(row => [row.name, row])
  )
);

export class ERC20Multicaller extends Multicaller {
  constructor(
    private readonly config = configService,
    private readonly jsonProvider = rpcProviderService.jsonProvider
  ) {
    super(config.network.key, jsonProvider, ERC20ABIs);
  }
}
