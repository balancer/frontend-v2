import { initContractConcernWithDefaultMocks } from '@/dependencies/contract.concern.mocks';
import { getBalancerSDK } from '@/dependencies/balancer-sdk';
import { initBalancerSdkWithDefaultMocks } from '@/dependencies/balancer-sdk.mocks';
import { Web3ProviderMock } from '@/dependencies/wallets/wallet-connector-mocks';
import { vaultService } from '@/services/contracts/vault.service';
import { Pool } from '@/services/pool/types';
import { aWeightedPool } from '@/__mocks__/weighted-pool';
import { buildExitParams } from '@tests/unit/builders/join-exit.builders';
import { ExitType } from './exit-pool.handler';
import { SwapExitHandler } from './swap-exit.handler';
import { defaultTransactionResponse } from '@tests/unit/builders/signer';
import { silenceConsoleLog } from '@tests/unit/console';

initBalancerSdkWithDefaultMocks();
initContractConcernWithDefaultMocks();

silenceConsoleLog(vi, message => message.includes('sendTransaction'));

async function mountSwapExitHandler(pool: Pool) {
  return new SwapExitHandler(ref(pool), getBalancerSDK());
}

const exitParams = buildExitParams({
  bptIn: '0.00000000000000001',
  exitType: ExitType.GivenIn,
  slippageBsp: 0.5,
});

test('Successfully executes a swap exit transaction', async () => {
  //@ts-ignore
  vaultService.walletService.setUserProvider(
    computed(() => new Web3ProviderMock())
  );
  const handler = await mountSwapExitHandler(aWeightedPool());

  const swapResult = await handler.exit(exitParams);

  expect(swapResult).toEqual(defaultTransactionResponse);
});
