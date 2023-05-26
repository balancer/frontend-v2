import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { sleep } from '@/lib/utils';
import { providePoolStaking } from '@/providers/local/pool-staking.provider';
import { provideUserData } from '@/providers/user-data.provider';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import {
  StakeAction,
  StakePreviewProps,
  useStakePreview,
} from './useStakePreview';

initDependenciesWithDefaultMocks();

const emit = vi.fn();

const props: StakePreviewProps = reactive({
  pool: aWeightedPool(),
  action: 'stake',
});
async function mountUseStakePreview() {
  const { result } = await mountComposable(() => useStakePreview(props, emit), {
    intermediateProvider: () => {
      providePoolStaking();
    },
    extraProvidersCb: () => provideUserData(),
  });
  return result;
}

test('Changes action label when props action changes', async () => {
  const { stakeActions } = await mountUseStakePreview();

  expect(stakeActions.value).toHaveLength(1);
  expect(stakeActions.value[0].label).toEqual('Stake');

  props.action = 'unstake';
  // Wait for watcher to change actions
  await sleep(10);

  expect(stakeActions.value).toHaveLength(1);
  expect(stakeActions.value[0].label).toEqual('Unstake');

  props.action = 'restake';
  // Wait for watcher to change actions
  await sleep(10);

  expect(stakeActions.value).toHaveLength(2);
  expect(stakeActions.value[0].label).toEqual('Unstake');
  expect(stakeActions.value[1].label).toEqual('Stake');
});

test.only('Changes action label when props action changes', async () => {
  props.action = 'stake';
  const { stakeActions } = await mountUseStakePreview();
  props.action = 'restake';
  await sleep(10);
});
