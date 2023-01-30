export declare class Token {
    readonly chainId: number;
    readonly address: string;
    readonly decimals: number;
    readonly symbol?: string;
    readonly name?: string;
    readonly wrapped: string;
    readonly isNative: boolean;
    constructor(chainId: number, address: string, decimals: number, symbol?: string, name?: string, wrapped?: string, isNative?: boolean);
    isEqual(token: Token): boolean;
}
