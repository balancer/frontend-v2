export const TOKEN_LIST_DEFAULT =
  'https://storageapi.fleek.co/balancer-team-bucket/assets/listed.tokenlist.json';

export const ELIGIBLE_TOKEN_LIST = 'https://storageapi.fleek.co/balancer-team-bucket/assets/vetted.tokenlist.json';

export const TOKEN_LISTS: string[] = [
  TOKEN_LIST_DEFAULT,
  'ipns://tokens.uniswap.org',
  'tokenlist.zerion.eth',
  'tokens.1inch.eth',
  'tokenlist.aave.eth',
  'https://tokens.coingecko.com/uniswap/all.json',
  'https://umaproject.org/uma.tokenlist.json'
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
