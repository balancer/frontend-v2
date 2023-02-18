export declare function _calculateInvariant(amplificationParameter: bigint, balances: bigint[], roundUp?: boolean): bigint;
export declare function _calcOutGivenIn(amplificationParameter: bigint, balances: bigint[], tokenIndexIn: number, tokenIndexOut: number, tokenAmountIn: bigint, invariant: bigint): bigint;
export declare function _calcInGivenOut(amplificationParameter: bigint, balances: bigint[], tokenIndexIn: number, tokenIndexOut: number, tokenAmountOut: bigint, invariant: bigint): bigint;
export declare function _calcBptOutGivenExactTokensIn(amp: bigint, balances: bigint[], amountsIn: bigint[], bptTotalSupply: bigint, currentInvariant: bigint, swapFee: bigint): bigint;
export declare function _calcTokenInGivenExactBptOut(amp: bigint, balances: bigint[], tokenIndex: number, bptAmountOut: bigint, bptTotalSupply: bigint, currentInvariant: bigint, swapFee: bigint): bigint;
export declare function _calcBptInGivenExactTokensOut(amp: bigint, balances: bigint[], amountsOut: bigint[], bptTotalSupply: bigint, currentInvariant: bigint, swapFee: bigint): bigint;
export declare function _calcTokenOutGivenExactBptIn(amp: bigint, balances: bigint[], tokenIndex: number, bptAmountIn: bigint, bptTotalSupply: bigint, currentInvariant: bigint, swapFee: bigint): bigint;
export declare function _getTokenBalanceGivenInvariantAndAllOtherBalances(amplificationParameter: bigint, balances: bigint[], invariant: bigint, tokenIndex: number): bigint;
