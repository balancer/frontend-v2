import PoolRepository from '@/services/pool/pool.repository';
import { TokenInfoMap } from '@/types/TokenList';
import { computed } from 'vue';

describe('Building a pool repository', () => {
  it('Logs when balancer api provider is skipped', () => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const log = jest.spyOn(console, 'log').mockImplementationOnce(() => {});
    new PoolRepository(computed(() => ({} as TokenInfoMap)));
    expect(log).toBeCalledWith(
      'Skipping balancer api provider in your current network (Goerli)'
    );
  });
});
