import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mountComposable } from '@tests/mount-helpers';
import { useSwapAssets } from './useSwapAssets';

const defaultOutputAddress = '0xe0C9275E44Ea80eF17579d33c55136b7DA269aEb';
const balAddress = '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3';

initDependenciesWithDefaultMocks();

test('Initializes local storage with default assets', async () => {
  const { result } = mountComposable(() => useSwapAssets());

  expect(result.inputAsset.value).toBe(
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
  );
  expect(result.outputAsset.value).toBe(defaultOutputAddress);
});

test('Allows setting input asset', async () => {
  const { result } = mountComposable(() => useSwapAssets());

  result.setInputAsset(balAddress);

  expect(result.inputAsset.value).toBe(balAddress);
});

test('Allows setting output asset', async () => {
  const { result } = mountComposable(() => useSwapAssets());

  result.setOutputAsset(balAddress);

  expect(result.outputAsset.value).toBe(balAddress);
});
