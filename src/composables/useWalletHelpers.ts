import { useUserAgent } from './useUserAgent';

type NonMetaMaskFlag =
  | 'isRabby'
  | 'isBraveWallet'
  | 'isTrustWallet'
  | 'isLedgerConnect';

const allNonMetamaskFlags: NonMetaMaskFlag[] = [
  'isRabby',
  'isBraveWallet',
  'isTrustWallet',
  'isLedgerConnect',
];

export function useWalletHelpers() {
  const { isMobile } = useUserAgent();

  function getIsMetaMaskWallet(): boolean {
    return Boolean(
      window.ethereum?.isMetaMask &&
        !allNonMetamaskFlags.some(flag => window.ethereum?.[flag])
    );
  }

  function getIsMetaMaskBrowser(): boolean {
    return isMobile && getIsMetaMaskWallet();
  }

  return { getIsMetaMaskWallet, getIsMetaMaskBrowser };
}
