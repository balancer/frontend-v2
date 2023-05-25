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
import {
  defaultWalletTransactionResponse,
  walletProviderMock,
  walletSignerMock,
} from '@/services/contracts/vault.service.mocks';
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
  defaultGaugeBalance,
  defaultNonPreferentialGaugeAddress,
  defaultPreferentialGaugeAddress,
} from '@/services/balancer/gauges/__mocks__/gauge-mocks';
import { defaultContractBalance } from '@/dependencies/EthersContract.mocks';
import { defaultTokenBalance } from '../__mocks__/tokens.provider.fake';
import { parseUnits } from '@ethersproject/units';
import {
  defaultGaugeToGaugeResponse,
  migrationsMock,
} from '@/dependencies/balancer-sdk.mocks';

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

test.only('Creates unstake transaction', async () => {
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

test('Creates restake transaction', async () => {
  walletServiceInstance.setUserProvider(computed(() => walletProviderMock));

  const { buildRestake } = await mountPoolStakingProvider(aWeightedPool());

  // In a previous step (during Stake Preview), the user approved the incoming Relayer transaction
  const relayerSignature = 'Relayer Signature';

  const restake = buildRestake(relayerSignature);

  const transactionResponse = await restake();

  // Sends a transaction using the wallet provider signer
  expect(transactionResponse).toEqual(defaultWalletTransactionResponse);
  // Uses the txInfo returned from the gauge2gauge call
  expect(walletSignerMock.sendTransaction).toHaveBeenCalledOnceWith(
    defaultGaugeToGaugeResponse
  );

  // Calls gauge2gauge with proper parameters
  expect(migrationsMock.gauge2gauge).toHaveBeenCalledOnce();
  // const params = firstCallParams(
  //    migrationsMock.gauge2gauge
  //  );

  const params = migrationsMock.gauge2gauge.mock.calls[0][0];
  // Restakes with the balance of the first gauge with balance
  expect(params.balance).toBe(parseUnits(defaultGaugeBalance).toString());
});
