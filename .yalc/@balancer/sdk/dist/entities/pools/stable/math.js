const AMP_PRECISION = 1000n;
export function _calculateInvariant(amplificationParameter, balances) {
    let sum = 0n;
    const numTokens = balances.length;
    for (let i = 0; i < numTokens; i++) {
        sum += balances[i];
    }
    if (sum == 0n) {
        return 0n;
    }
    let prevInvariant;
    let invariant = sum;
    const ampTimesTotal = amplificationParameter * BigInt(numTokens);
    for (let i = 0; i < 255; i++) {
        let D_P = invariant;
        for (let j = 0; j < numTokens; j++) {
            D_P = (D_P * invariant) / (balances[j] * BigInt(numTokens));
        }
        prevInvariant = invariant;
        invariant =
            (((ampTimesTotal * sum) / AMP_PRECISION + D_P * BigInt(numTokens)) * invariant) /
                (((ampTimesTotal - AMP_PRECISION) * invariant) / AMP_PRECISION +
                    (BigInt(numTokens) + 1n) * D_P);
        if (invariant > prevInvariant) {
            if (invariant - prevInvariant <= 1n) {
                return invariant;
            }
        }
        else if (prevInvariant - invariant <= 1n) {
            return invariant;
        }
    }
    throw new Error('Errors.STABLE_INVARIANT_DIDNT_CONVERGE');
}
export function _calcOutGivenIn(amplificationParameter, balances, tokenIndexIn, tokenIndexOut, tokenAmountIn, invariant) {
    balances[tokenIndexIn] = balances[tokenIndexIn] + tokenAmountIn;
    const finalBalanceOut = _getTokenBalanceGivenInvariantAndAllOtherBalances(amplificationParameter, balances, invariant, tokenIndexOut);
    balances[tokenIndexIn] = balances[tokenIndexIn] - tokenAmountIn;
    return balances[tokenIndexOut] - finalBalanceOut - 1n;
}
export function _calcInGivenOut(amplificationParameter, balances, tokenIndexIn, tokenIndexOut, tokenAmountOut, invariant) {
    balances[tokenIndexIn] = balances[tokenIndexIn] - tokenAmountOut;
    const finalBalanceIn = _getTokenBalanceGivenInvariantAndAllOtherBalances(amplificationParameter, balances, invariant, tokenIndexIn);
    balances[tokenIndexOut] = balances[tokenIndexOut] - tokenAmountOut;
    return finalBalanceIn - balances[tokenIndexIn] + 1n;
}
export function _getTokenBalanceGivenInvariantAndAllOtherBalances(amplificationParameter, balances, invariant, tokenIndex) {
    const ampTimesTotal = amplificationParameter * BigInt(balances.length);
    let sum = balances[0];
    let P_D = balances[0] * BigInt(balances.length);
    for (let j = 1; j < balances.length; j++) {
        P_D = (P_D * balances[j] * BigInt(balances.length)) / invariant;
        sum += balances[j];
    }
    sum = sum - balances[tokenIndex];
    const inv2 = invariant * invariant;
    const c = (inv2 / (ampTimesTotal * P_D)) * AMP_PRECISION * balances[tokenIndex];
    const b = sum + ((invariant / ampTimesTotal) * AMP_PRECISION);
    let prevTokenBalance = 0n;
    let tokenBalance = (inv2 + c) / (invariant + b);
    for (let i = 0; i < 255; i++) {
        prevTokenBalance = tokenBalance;
        tokenBalance = (tokenBalance * tokenBalance + c) / (tokenBalance * 2n + b - invariant);
        if (tokenBalance > prevTokenBalance) {
            if (tokenBalance - prevTokenBalance <= 1n) {
                return tokenBalance;
            }
        }
        else if (prevTokenBalance - tokenBalance <= 1n) {
            return tokenBalance;
        }
    }
    throw new Error('Errors.STABLE_GET_BALANCE_DIDNT_CONVERGE');
}
//# sourceMappingURL=math.js.map