import { Token } from '../entities/token';
export declare const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
export declare const MAX_UINT112 = 5192296858534827628530496329220095n;
export declare const PREMINTED_STABLE_BPT = 2596148429267413814265248164610048n;
export declare const SECONDS_PER_YEAR = 31536000n;
export declare enum ChainId {
    MAINNET = 1,
    GOERLI = 5,
    POLYGON = 137,
    ARBITRUM_ONE = 42161
}
export declare const SUBGRAPH_URLS: {
    1: string;
    5: string;
    137: string;
    42161: string;
};
export declare const NATIVE_ASSETS: {
    1: Token;
    5: Token;
    137: Token;
};
export declare const ETH: Token;
export declare const DEFAULT_FUND_MANAGMENT: {
    sender: string;
    recipient: string;
    fromInternalBalance: boolean;
    toInternalBalance: boolean;
};
export declare const DEFAULT_USERDATA = "0x";
