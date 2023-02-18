import { PoolType, SwapKind } from '../../../types';
import { Token, TokenAmount } from '../../';
import { ALMOST_ONE, getPoolAddress, MathSol, PREMINTED_STABLE_BPT, unsafeFastParseEther, WAD, } from '../../../utils';
import { _calcBptInGivenExactTokensOut, _calcBptOutGivenExactTokensIn, _calcInGivenOut, _calcOutGivenIn, _calcTokenInGivenExactBptOut, _calcTokenOutGivenExactBptIn, _calculateInvariant, } from './math';
class StablePoolToken extends TokenAmount {
    constructor(token, amount, rate, index) {
        super(token, amount);
        this.rate = BigInt(rate);
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
        this.index = index;
    }
}
class BPT extends TokenAmount {
    constructor(token, amount, index) {
        super(token, amount);
        this.rate = WAD;
        this.virtualBalance = PREMINTED_STABLE_BPT - this.amount;
        this.index = index;
    }
}
export class StablePool {
    static fromRawPool(pool) {
        const poolTokens = [];
        for (const t of pool.tokens) {
            if (!t.priceRate)
                throw new Error('Stable pool token does not have a price rate');
            const token = new Token(1, t.address, t.decimals, t.symbol, t.name);
            const tokenAmount = TokenAmount.fromHumanAmount(token, t.balance);
            if (t.address === pool.address) {
                poolTokens.push(new BPT(token, tokenAmount.amount, t.index));
            }
            else {
                poolTokens.push(new StablePoolToken(token, tokenAmount.amount, unsafeFastParseEther(t.priceRate), t.index));
            }
        }
        const totalShares = unsafeFastParseEther(pool.totalShares);
        const amp = BigInt(pool.amp) * 1000n;
        return new StablePool(pool.id, amp, unsafeFastParseEther(pool.swapFee), poolTokens, totalShares);
    }
    constructor(id, amp, swapFee, tokens, totalShares) {
        this.poolType = PoolType.ComposableStable;
        this.id = id;
        this.address = getPoolAddress(id);
        this.amp = amp;
        this.swapFee = swapFee;
        this.totalShares = totalShares;
        this.tokens = tokens.sort((a, b) => a.index - b.index);
        this.tokenMap = new Map(this.tokens.map(token => [token.token.address, token]));
        this.tokenIndexMap = new Map(this.tokens.map(token => [token.token.address, token.index]));
        this.bptIndex = this.tokenIndexMap.get(this.address) || -1;
        this.tokensNoBpt = [...this.tokens];
        // Splice outside assigment, otherwise returns the removed element
        this.tokensNoBpt.splice(this.bptIndex, 1);
        this.tokenNoBptIndexMap = new Map(this.tokensNoBpt.map(token => [
            token.token.address,
            token.index > this.bptIndex ? token.index - 1 : token.index,
        ]));
    }
    getNormalizedLiquidity(tokenIn, tokenOut) {
        const tIn = this.tokenMap.get(tokenIn.address);
        const tOut = this.tokenMap.get(tokenOut.address);
        if (!tIn || !tOut)
            throw new Error('Pool does not contain the tokens provided');
        // TODO: Fix stable normalized liquidity calc
        return tOut.amount * this.amp;
    }
    swapGivenIn(tokenIn, tokenOut, swapAmount) {
        const tInIndex = this.tokenIndexMap.get(tokenIn.address);
        const tOutIndex = this.tokenIndexMap.get(tokenOut.address);
        if (typeof tInIndex !== 'number' || typeof tOutIndex !== 'number') {
            throw new Error('Pool does not contain the tokens provided');
        }
        // TODO: Fix stable swap limit
        if (swapAmount.scale18 > this.tokens[tInIndex].scale18) {
            throw new Error('Swap amount exceeds the pool limit');
        }
        // Don't use || assignment - if map get returns 0 index that is falsey
        const tInIndexNoBpt = this.tokenNoBptIndexMap.get(tokenIn.address);
        const tOutIndexNoBpt = this.tokenNoBptIndexMap.get(tokenOut.address);
        const balancesNoBpt = this.tokensNoBpt.map(t => t.scale18);
        const invariant = _calculateInvariant(this.amp, balancesNoBpt);
        let tokenOutScale18;
        if (tokenIn.isEqual(this.tokens[this.bptIndex].token)) {
            if (typeof tOutIndexNoBpt !== 'number')
                throw new Error('Pool does not contain the tokens provided');
            const amountInWithRate = swapAmount.mulDownFixed(this.tokens[tInIndex].rate);
            tokenOutScale18 = _calcTokenOutGivenExactBptIn(this.amp, [...balancesNoBpt], tOutIndexNoBpt, amountInWithRate.scale18, this.totalShares, invariant, this.swapFee);
        }
        else if (tokenOut.isEqual(this.tokens[this.bptIndex].token)) {
            const amountsIn = new Array(this.tokensNoBpt.length).fill(0n);
            if (typeof tInIndexNoBpt !== 'number')
                throw new Error('Pool does not contain the tokens provided');
            const amountInWithRate = swapAmount.mulDownFixed(this.tokens[tInIndex].rate);
            amountsIn[tInIndexNoBpt] = amountInWithRate.scale18;
            tokenOutScale18 = _calcBptOutGivenExactTokensIn(this.amp, [...balancesNoBpt], amountsIn, this.totalShares, invariant, this.swapFee);
        }
        else {
            const amountInWithFee = this.subtractSwapFeeAmount(swapAmount);
            const amountInWithRate = amountInWithFee.mulDownFixed(this.tokens[tInIndex].rate);
            if (typeof tInIndexNoBpt !== 'number' || typeof tOutIndexNoBpt !== 'number')
                throw new Error('Pool does not contain the tokens provided');
            tokenOutScale18 = _calcOutGivenIn(this.amp, [...balancesNoBpt], tInIndexNoBpt, tOutIndexNoBpt, amountInWithRate.scale18, invariant);
        }
        const amountOut = TokenAmount.fromScale18Amount(tokenOut, tokenOutScale18);
        return amountOut.divDownFixed(this.tokens[tOutIndex].rate);
    }
    swapGivenOut(tokenIn, tokenOut, swapAmount) {
        const tInIndex = this.tokenIndexMap.get(tokenIn.address);
        const tOutIndex = this.tokenIndexMap.get(tokenOut.address);
        if (typeof tInIndex !== 'number' || typeof tOutIndex !== 'number') {
            throw new Error('Pool does not contain the tokens provided');
        }
        // TODO: Fix stable swap limit
        if (swapAmount.scale18 > this.tokens[tOutIndex].scale18) {
            throw new Error('Swap amount exceeds the pool limit');
        }
        // Don't use || assignment - if map get returns 0 index that is falsey
        const tInIndexNoBpt = this.tokenNoBptIndexMap.get(tokenIn.address);
        const tOutIndexNoBpt = this.tokenNoBptIndexMap.get(tokenOut.address);
        const amountOutWithRate = swapAmount.mulDownFixed(this.tokens[tOutIndex].rate);
        const balancesNoBpt = this.tokensNoBpt.map(t => t.scale18);
        const invariant = _calculateInvariant(this.amp, balancesNoBpt);
        let amountIn;
        if (tokenIn.isEqual(this.tokens[this.bptIndex].token)) {
            if (typeof tOutIndexNoBpt !== 'number')
                throw new Error('Pool does not contain the tokens provided');
            const amountsOut = new Array(this.tokensNoBpt.length).fill(0n);
            amountsOut[tOutIndexNoBpt] = amountOutWithRate.scale18;
            const tokenInScale18 = _calcBptInGivenExactTokensOut(this.amp, [...balancesNoBpt], amountsOut, this.totalShares, invariant, this.swapFee);
            amountIn = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true).divDownFixed(this.tokens[tInIndex].rate);
        }
        else if (tokenOut.isEqual(this.tokens[this.bptIndex].token)) {
            if (typeof tInIndexNoBpt !== 'number')
                throw new Error('Pool does not contain the tokens provided');
            const tokenInScale18 = _calcTokenInGivenExactBptOut(this.amp, [...balancesNoBpt], tInIndexNoBpt, amountOutWithRate.scale18, this.totalShares, invariant, this.swapFee);
            amountIn = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true).divDownFixed(this.tokens[tInIndex].rate);
        }
        else {
            if (typeof tInIndexNoBpt !== 'number' || typeof tOutIndexNoBpt !== 'number')
                throw new Error('Pool does not contain the tokens provided');
            const tokenInScale18 = _calcInGivenOut(this.amp, [...balancesNoBpt], tInIndexNoBpt, tOutIndexNoBpt, amountOutWithRate.scale18, invariant);
            const amountInWithoutFee = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true);
            const amountInWithFee = this.addSwapFeeAmount(amountInWithoutFee);
            amountIn = amountInWithFee.divDownFixed(this.tokens[tInIndex].rate);
        }
        return amountIn;
    }
    subtractSwapFeeAmount(amount) {
        const feeAmount = amount.mulUpFixed(this.swapFee);
        return amount.sub(feeAmount);
    }
    addSwapFeeAmount(amount) {
        return amount.divUpFixed(MathSol.complementFixed(this.swapFee));
    }
    getLimitAmountSwap(tokenIn, tokenOut, swapKind) {
        const tIn = this.tokenMap.get(tokenIn.address);
        const tOut = this.tokenMap.get(tokenOut.address);
        if (!tIn || !tOut)
            throw new Error('Pool does not contain the tokens provided');
        if (swapKind === SwapKind.GivenIn) {
            // Return max valid amount of tokenIn
            // As an approx - use almost the total balance of token out as we can add any amount of tokenIn and expect some back
            return (tIn.amount * ALMOST_ONE) / tIn.rate;
        }
        else {
            // Return max amount of tokenOut - approx is almost all balance
            return (tOut.amount * ALMOST_ONE) / tOut.rate;
        }
    }
}
//# sourceMappingURL=index.js.map