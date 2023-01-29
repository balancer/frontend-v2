export declare class Token {
    readonly chainId: number;
    readonly address: string;
    readonly decimals: number;
    readonly symbol?: string;
    readonly name?: string;
    constructor(chainId: number, address: string, decimals: number, symbol?: string, name?: string);
    isEqual(token: Token): boolean;
}
