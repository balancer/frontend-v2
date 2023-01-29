export declare function _calculateInvariant(amplificationParameter: bigint, balances: bigint[]): bigint;
export declare function _calcOutGivenIn(amplificationParameter: bigint, balances: bigint[], tokenIndexIn: number, tokenIndexOut: number, tokenAmountIn: bigint, invariant: bigint): bigint;
export declare function _calcInGivenOut(amplificationParameter: bigint, balances: bigint[], tokenIndexIn: number, tokenIndexOut: number, tokenAmountOut: bigint, invariant: bigint): bigint;
export declare function _getTokenBalanceGivenInvariantAndAllOtherBalances(amplificationParameter: bigint, balances: bigint[], invariant: bigint, tokenIndex: number): bigint;
