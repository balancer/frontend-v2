import { Token } from '../entities/token';
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
export const MAX_UINT112 = 5192296858534827628530496329220095n;
export const PREMINTED_STABLE_BPT = 2596148429267413814265248164610048n; // 2**111
export const SECONDS_PER_YEAR = 31536000n;
export var ChainId;
(function (ChainId) {
    ChainId[ChainId["MAINNET"] = 1] = "MAINNET";
    ChainId[ChainId["GOERLI"] = 5] = "GOERLI";
    ChainId[ChainId["POLYGON"] = 137] = "POLYGON";
    ChainId[ChainId["ARBITRUM_ONE"] = 42161] = "ARBITRUM_ONE";
})(ChainId || (ChainId = {}));
export const SUBGRAPH_URLS = {
    [ChainId.MAINNET]: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-v2',
    [ChainId.GOERLI]: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-goerli-v2',
    [ChainId.POLYGON]: 'https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-polygon-prune-v2',
    [ChainId.ARBITRUM_ONE]: `https://api.thegraph.com/subgraphs/name/balancer-labs/balancer-arbitrum-v2`,
};
export const NATIVE_ASSETS = {
    [ChainId.MAINNET]: new Token(ChainId.MAINNET, '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 18, 'ETH', 'Ether', '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', true),
    [ChainId.GOERLI]: new Token(ChainId.GOERLI, ZERO_ADDRESS, 18, 'ETH', 'Ether'),
    [ChainId.POLYGON]: new Token(ChainId.POLYGON, ZERO_ADDRESS, 18, 'MATIC', 'Matic'),
};
export const ETH = NATIVE_ASSETS[ChainId.MAINNET];
export const DEFAULT_FUND_MANAGMENT = {
    sender: ZERO_ADDRESS,
    recipient: ZERO_ADDRESS,
    fromInternalBalance: false,
    toInternalBalance: false,
};
export const DEFAULT_USERDATA = '0x';
//# sourceMappingURL=constants.js.map