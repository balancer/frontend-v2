export const TOKEN_LIST_DEFAULT = 'textcoin.eth';

export const TOKEN_LISTS: string[] = [
  TOKEN_LIST_DEFAULT,
  'tokens.uniswap.eth'
  // 'tokens.1inch.eth', Fail to load
  // 'synths.snx.eth',
  // 'tokenlist.dharma.eth',
  // 'defi.cmc.eth',
  // 'erc20.cmc.eth',
  // 'stablecoin.cmc.eth',
  // 'tokenlist.zerion.eth',
  // 'tokenlist.aave.eth',
  // 't2crtokens.eth'
];

export const ETHER = {
  id: 'ether',
  name: 'Ether',
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  symbol: 'ETH',
  decimals: 18,
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
};
