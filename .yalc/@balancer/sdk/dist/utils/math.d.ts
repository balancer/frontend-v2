export declare const WAD = 1000000000000000000n;
export declare const RAY = 1000000000000000000000000000n;
export declare const TWO_WAD = 2000000000000000000n;
export declare const FOUR_WAD = 4000000000000000000n;
export declare const ALMOST_ONE: bigint;
export declare class MathSol {
    static max(a: bigint, b: bigint): bigint;
    static min(a: bigint, b: bigint): bigint;
    static MAX_POW_RELATIVE_ERROR: bigint;
    static mulDownFixed(a: bigint, b: bigint): bigint;
    static mulUpFixed(a: bigint, b: bigint): bigint;
    static divDownFixed(a: bigint, b: bigint): bigint;
    static divUpFixed(a: bigint, b: bigint): bigint;
    static divUp(a: bigint, b: bigint): bigint;
    static powUpFixed(x: bigint, y: bigint, version?: number): bigint;
    static powDownFixed(x: bigint, y: bigint, version?: number): bigint;
    static complementFixed(x: bigint): bigint;
}
