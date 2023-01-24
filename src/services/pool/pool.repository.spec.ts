import PoolRepository from '@/services/pool/pool.repository';
import { TokenInfoMap } from '@/types/TokenList';
import { computed } from 'vue';

vi.mock('@/services/web3/useWeb3');

describe('Building a pool repository', () => {
  it('avoids balancer Api as a repository when it is not defined', () => {
    const poolRepository = new PoolRepository(
      computed(() => ({} as TokenInfoMap))
    );
    // @ts-ignore
    expect(poolRepository.repository.providers).toHaveLength(1);
  });
});
