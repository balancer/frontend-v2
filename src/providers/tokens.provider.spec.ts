import {
  defaultTokenUSDPrice,
  mockedTokenPrice,
} from '@/dependencies/balancer-sdk.mocks';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { initMulticallerWithDefaultMocks } from '@/dependencies/Multicaller.mocks';
import { mockedOnchainTokenName } from '@/dependencies/OldMulticaller.mocks';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { configService } from '@/services/config/config.service';
import { mountComposable } from '@tests/mount-helpers';
import waitForExpect from 'wait-for-expect';
import { tokensProvider } from './tokens.provider';

const originalConsoleLog = console.log;
vi.spyOn(console, 'log').mockImplementation((message, optionalParams) => {
  // Silence Fetching logs
  if (message.startsWith('Fetching')) return;
  originalConsoleLog(message, optionalParams);
});

initDependenciesWithDefaultMocks();

async function mountTokenProvider() {
  const { result } = mountComposable(() =>
    tokensProvider(provideUserSettings(), provideTokenLists())
  );

  const { dynamicDataLoaded } = result;

  expect(dynamicDataLoaded.value).toBeFalse();

  await waitForExpect(() => {
    expect(dynamicDataLoaded.value).toBeTrue();
  });

  return result;
}

const contractAddress = '0xBA12222222228d8Ba445958a75a0704d566BF2C8';
const balTokenAddress = '0xfA8449189744799aD2AcE7e0EBAC8BB7575eff47';
const { veBAL } = configService.network.addresses;

test('loads prices, allowances and balances', async () => {
  const { allowances, prices, balances } = await mountTokenProvider();

  expect(allowances.value[contractAddress][balTokenAddress]).toEqual('0.0');

  expect(prices.value[balTokenAddress]).toEqual(mockedTokenPrice);

  expect(balances.value[balTokenAddress]).toEqual('0.000000000000000025');
});

test('injects veBAL onchain data', async () => {
  const { injectedTokens, tokens } = await mountTokenProvider();

  expect(tokens.value[veBAL].name).toEqual(mockedOnchainTokenName);

  expect(injectedTokens.value).toMatchInlineSnapshot(`
    {
      "0x33A99Dcc4C85C014cf12626959111D5898bbCAbF": {
        "address": "0x33A99Dcc4C85C014cf12626959111D5898bbCAbF",
        "chainId": 5,
        "decimals": 18,
        "logoURI": "",
        "name": "mocked onchain token name",
        "symbol": "mocked onchain token symbol",
      },
    }
  `);
});

test('injects new tokens', async () => {
  const { injectTokens, injectedTokens } = await mountTokenProvider();

  const newTokenAddress = '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce';
  await injectTokens([newTokenAddress]);

  expect(injectedTokens.value).toMatchInlineSnapshot(`
    {
      "0x33A99Dcc4C85C014cf12626959111D5898bbCAbF": {
        "address": "0x33A99Dcc4C85C014cf12626959111D5898bbCAbF",
        "chainId": 5,
        "decimals": 18,
        "logoURI": "",
        "name": "mocked onchain token name",
        "symbol": "mocked onchain token symbol",
      },
      "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE": {
        "address": "0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE",
        "chainId": 5,
        "decimals": 18,
        "logoURI": "",
        "name": "mocked onchain token name",
        "symbol": "mocked onchain token symbol",
      },
    }
  `);
});

test('generates balancerFor', async () => {
  initMulticallerWithDefaultMocks();
  const { balanceFor, priceFor } = await mountTokenProvider();

  expect(balanceFor(veBAL)).toEqual('0.000000000000000025');
  expect(balanceFor(balTokenAddress)).toEqual('0.000000000000000025');
  expect(priceFor(veBAL)).toEqual(defaultTokenUSDPrice);
  expect(priceFor(balTokenAddress)).toEqual(defaultTokenUSDPrice);
});
