export const TOKEN_LIST_DEFAULT =
  'https://storageapi.fleek.co/balancer-team-bucket/assets/listed.tokenlist.json';

export const TOKEN_LISTS: string[] = [
  TOKEN_LIST_DEFAULT,
  'ipns://tokens.uniswap.org',
  'tokenlist.zerion.eth',
  'tokens.1inch.eth',
  'tokenlist.aave.eth',
  'https://umaproject.org/uma.tokenlist.json'
];

export const NAMED_TOKEN_LISTS = {
  Default: TOKEN_LIST_DEFAULT,
  Uniswap: 'ipns://tokens.uniswap.org',
  Zerion: 'tokenlist.zerion.eth',
  '1inch': 'tokens.1inch.eth',
  Aave: 'tokenlist.aave.eth',
  UMA: 'https://umaproject.org/uma.tokenlist.json'
};

export const ETHER = {
  id: 'ether',
  name: 'Ether',
  address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
  symbol: 'ETH',
  decimals: 18,
  logoURI:
    'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/assets/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2/logo.png'
};
