import {
  defaultTokenUSDPrice,
  mockedTokenPrice,
} from '@/dependencies/balancer-sdk.mocks';
import { initDependenciesWithDefaultMocks } from '@/dependencies/default-mocks';
import { mockedOnchainTokenName } from '@/dependencies/Multicaller.mocks';
import { provideTokenLists } from '@/providers/token-lists.provider';
import { provideUserSettings } from '@/providers/user-settings.provider';
import { configService } from '@/services/config/config.service';
import { mountComposable } from '@tests/mount-helpers';
import { noop } from 'lodash';
import waitForExpect from 'wait-for-expect';
import { tokensProvider } from './tokens.provider';

vi.spyOn(console, 'log').mockImplementation(noop);

vi.mock('@ethersproject/address', () => ({
  getAddress: address => address,
  isAddress: () => true,
}));

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

  await injectTokens(['new token address']);

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
      "new token address": {
        "address": "new token address",
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
  const { balanceFor, priceFor } = await mountTokenProvider();

  expect(balanceFor(veBAL)).toEqual('0.000000000000000025');
  expect(balanceFor(balTokenAddress)).toEqual('0.000000000000000025');
  expect(priceFor(veBAL)).toEqual(defaultTokenUSDPrice);
  expect(priceFor(balTokenAddress)).toEqual(defaultTokenUSDPrice);
});
