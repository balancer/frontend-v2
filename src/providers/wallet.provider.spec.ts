import {
  fakeMetamaskAccount,
  gnosisAccount,
  SafeConnectorMock,
  MetamaskConnectorMock,
  tallyAccount,
  TallyConnectorMock,
  walletconnectAccount,
  WalletConnectConnectorMock,
  walletLinkAccount,
  WalletLinkConnectorMock,
  Web3ProviderMock,
} from './../dependencies/wallets/wallet-connector-mocks';
/* eslint-disable @typescript-eslint/no-empty-function */
// eslint-disable-next-line no-restricted-imports
import { initSafeConnectorForTesting } from '@/dependencies/wallets/safe';
import { initMetamaskConnectorForTesting } from '@/dependencies/wallets/metamask';
import { initTallyConnectorForTesting } from '@/dependencies/wallets/tally';
import { initWalletconnectConnectorForTesting } from '@/dependencies/wallets/walletconnect';
import { initWalletLinkConnectorForTesting } from '@/dependencies/wallets/walletlink';
import { initWeb3Provider } from '@/dependencies/wallets/Web3Provider';
import { lsGet } from '@/lib/utils';
import { mountComposable } from '@tests/mount-helpers';
import { SANCTIONED_ADDRESS } from '@tests/msw/rest-handlers';
import { isBlockedAddress, useWallets } from './wallet.provider';
import { initContractConcernWithDefaultMocks } from '@/dependencies/contract.concern.mocks';

initContractConcernWithDefaultMocks();

describe('Given that VITE_WALLET_SCREENING is false', () => {
  beforeAll(() => {
    //@ts-ignore
    import.meta.env.VITE_WALLET_SCREENING = false;
  });

  it('skips sanctioned address check', async () => {
    const result = await isBlockedAddress(SANCTIONED_ADDRESS);
    expect(result).toBeFalsy();
  });
});

describe('Given that VITE_WALLET_SCREENING is true', () => {
  beforeAll(() => {
    //@ts-ignore
    import.meta.env.VITE_WALLET_SCREENING = true;
  });

  it('detects sanctioned address', async () => {
    const result = await isBlockedAddress(SANCTIONED_ADDRESS);
    expect(result).toBeTruthy();
  });

  it('allows non sanctioned address', async () => {
    const NOT_SANCTIONED_ADDRESS = 'vitalic.eth';
    const result = await isBlockedAddress(NOT_SANCTIONED_ADDRESS);
    expect(result).toBeFalsy();
  });
});

async function mountWalletProvider() {
  const { result } = mountComposable(() => useWallets());
  return result;
}

initWeb3Provider(Web3ProviderMock);
// Default connector
initMetamaskConnectorForTesting(MetamaskConnectorMock);

test('Load with correct initial state', async () => {
  const { account, chainId, isBlocked, connector } =
    await mountWalletProvider();

  expect(account.value).toBe('');
  expect(chainId.value).toBeUndefined();
  expect(isBlocked.value).toBeFalse();
  expect(connector.value).toBeNull();
});

test('Logs error when trying to connect with a null wallet', async () => {
  console.error = vi.fn();

  const { connectWallet, walletState } = await mountWalletProvider();

  await connectWallet(null);

  expect(console.error).toHaveBeenCalledOnceWith(
    Error('Please provide a wallet to facilitate a web3 connection.')
  );
  expect(walletState.value).toBe('disconnected');
});

test('Logs error when trying to connect with an unsupported wallet', async () => {
  console.error = vi.fn();

  const { connectWallet, walletState } = await mountWalletProvider();

  // @ts-ignore
  await connectWallet('Foo');

  // 'Wallet Foo is not supported yet. Please contact the dev team to add this connector.'
  expect(console.error).toHaveBeenCalledOnce();

  expect(walletState.value).toBe('disconnected');
});

describe('Connects to wallet and saves connection in local storage', async () => {
  const { connectWallet, walletState } = await mountWalletProvider();

  test('with metamask', async () => {
    await connectWallet('metamask');

    expect(lsGet('connectedWallet')).toBe(fakeMetamaskAccount);
    expect(lsGet('connectedProvider')).toBe('metamask');
    expect(walletState.value).toBe('connected');
  });

  test('with walletconnect', async () => {
    initWalletconnectConnectorForTesting(WalletConnectConnectorMock);
    await connectWallet('walletconnect');

    expect(lsGet('connectedWallet')).toBe(walletconnectAccount);
    expect(lsGet('connectedProvider')).toBe('walletconnect');
    expect(walletState.value).toBe('connected');
  });

  test('with gnosis', async () => {
    initSafeConnectorForTesting(SafeConnectorMock);

    const { connectWallet, walletState } = await mountWalletProvider();

    await connectWallet('safe');

    expect(lsGet('connectedWallet')).toBe(gnosisAccount);
    expect(lsGet('connectedProvider')).toBe('safe');
    expect(walletState.value).toBe('connected');
  });

  test('with tally', async () => {
    initTallyConnectorForTesting(TallyConnectorMock);

    const { connectWallet, walletState } = await mountWalletProvider();

    await connectWallet('tally');

    expect(lsGet('connectedWallet')).toBe(tallyAccount);
    expect(lsGet('connectedProvider')).toBe('tally');
    expect(walletState.value).toBe('connected');
  });

  test('with walletLink', async () => {
    initWalletLinkConnectorForTesting(WalletLinkConnectorMock);

    const { connectWallet, walletState } = await mountWalletProvider();

    await connectWallet('walletlink');

    expect(lsGet('connectedWallet')).toBe(walletLinkAccount);
    expect(lsGet('connectedProvider')).toBe('walletlink');
    expect(walletState.value).toBe('connected');
  });
});

test('Disconnects from connected wallet', async () => {
  const { connectWallet, disconnectWallet, walletState, connector } =
    await mountWalletProvider();

  await connectWallet('metamask');

  await disconnectWallet();

  expect(walletState.value).toBe('disconnected');
  expect(connector.value).toBeNull();
});
