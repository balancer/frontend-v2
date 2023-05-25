import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { PoolGauges } from '@/composables/queries/usePoolGaugesQuery';
import { GaugeShare } from '@/composables/queries/useUserGaugeSharesQuery';
import {
  defaultContractTransactionResponse,
  sendTransactionMock,
} from '@/dependencies/contract.concern.mocks';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import {
  aGaugeShareResponse,
  aPoolGaugesResponse,
} from '@/services/balancer/gauges/__mocks__/gauge-builders';
import { walletProviderMock } from '@/services/contracts/vault.service.mocks';
import { Pool } from '@/services/pool/types';
import { SendTransactionOpts } from '@/services/web3/transactions/concerns/contract.concern';
import { walletService as walletServiceInstance } from '@/services/web3/wallet.service';
import { mountComposableWithFakeTokensProvider as mountComposable } from '@tests/mount-helpers';
import { server } from '@tests/msw/server';
import { firstCallParams } from '@tests/vitest/assertions';
import { graphql } from 'msw';
import waitForExpect from 'wait-for-expect';
import { provideUserData } from '../user-data.provider';
import { poolStakingProvider } from './pool-staking.provider';
import {
  defaultNonPreferentialGaugeAddress,
  defaultPreferentialGaugeAddress,
} from '@/services/balancer/gauges/__mocks__/gauge-mocks';
import { defaultContractBalance } from '@/dependencies/EthersContract.mocks';
import { defaultTokenBalance } from '../__mocks__/tokens.provider.fake';
import { parseUnits } from '@ethersproject/units';

initDependenciesWithDefaultMocks();

function mockGQLGaugeResponses(
  gaugeShares: GaugeShare[],
  poolGauges: PoolGauges
) {
  server.use(
    graphql.query('GaugeShares', (_, res, ctx) => {
      return res(
        ctx.data({
          gaugeShares: gaugeShares,
        })
      );
    }),
    graphql.query('PoolGauges', (_, res, ctx) => {
      return res(ctx.data(poolGauges));
    })
  );
}

async function mountPoolStakingProvider(pool: Pool) {
  const { result } = await mountComposable(() => poolStakingProvider(pool.id), {
    extraProvidersCb: () => provideUserData(),
  });

  await waitForExpect(() => {
    expect(result.isLoading.value).toBeFalse();
  });

  return result;
}

describe('hasNonPrefGaugeBalance', () => {
  test('when the user has shares in the preferential gauge', async () => {
    const gaugeShare = aGaugeShareResponse();
    gaugeShare.gauge.id = defaultPreferentialGaugeAddress;

    mockGQLGaugeResponses([gaugeShare], aPoolGaugesResponse());
    const { hasNonPrefGaugeBalance, preferentialGaugeAddress } =
      await mountPoolStakingProvider(aWeightedPool());

    expect(preferentialGaugeAddress.value).toBe(
      defaultPreferentialGaugeAddress
    );
    expect(hasNonPrefGaugeBalance.value).toBeFalse();
  });

  test('when the user has shares in a non preferential gauge', async () => {
    const gaugeShare = aGaugeShareResponse();
    gaugeShare.gauge.id = defaultNonPreferentialGaugeAddress;

    mockGQLGaugeResponses([gaugeShare], aPoolGaugesResponse());

    const { hasNonPrefGaugeBalance } = await mountPoolStakingProvider(
      aWeightedPool()
    );

    expect(hasNonPrefGaugeBalance.value).toBeTrue();
  });
});

test('Creates stake transaction', async () => {
  walletServiceInstance.setUserProvider(computed(() => walletProviderMock));

  const { stake } = await mountPoolStakingProvider(aWeightedPool());

  const transactionResponse = await stake();

  expect(transactionResponse).toEqual(defaultContractTransactionResponse);

  // Sends a deposit transaction in the correct gauge address
  expect(sendTransactionMock).toHaveBeenCalledOnce();
  const params = firstCallParams(sendTransactionMock) as SendTransactionOpts;
  expect(params.contractAddress).toBe(defaultPreferentialGaugeAddress);
  expect(params.action).toBe('deposit(uint256)');
  // params: User's current full BPT balance for this pool.
  expect(params.params?.toString()).toBe(
    parseUnits(defaultTokenBalance).toString()
  );
});

test('Creates unstake transaction', async () => {
  walletServiceInstance.setUserProvider(computed(() => walletProviderMock));

  const { unstake } = await mountPoolStakingProvider(aWeightedPool());

  const transactionResponse = await unstake();

  expect(transactionResponse).toEqual(defaultContractTransactionResponse);

  // Sends a withdraw transaction in the correct gauge address
  expect(sendTransactionMock).toHaveBeenCalledOnce();
  const params = firstCallParams(sendTransactionMock) as SendTransactionOpts;
  expect(params.contractAddress).toBe(defaultPreferentialGaugeAddress);
  expect(params.action).toBe('withdraw(uint256)');
  // params: balance of the gauge contract
  expect(params.params?.toString()).toBe(defaultContractBalance.toString());
});
