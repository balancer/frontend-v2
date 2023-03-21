import { Pools } from '@/types/pools';
import { configService } from '@/services/config/config.service';

const pools: Pools = configService.network.pools;

export default pools;
