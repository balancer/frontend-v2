import { PoolType, SwapKind } from '../../../types';
import { Token, TokenAmount } from '../../';
import { MathSol, WAD, getPoolAddress, unsafeFastParseEther } from '../../../utils';
import { _calculateInvariant, _calcOutGivenIn, _calcInGivenOut } from './math';
const ALMOST_ONE = BigInt(unsafeFastParseEther('0.99'));
export class StablePoolToken extends TokenAmount {
    constructor(token, amount, rate) {
        super(token, amount);
        this.rate = BigInt(rate);
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
    }
}
export class StablePool {
    static fromRawPool(pool) {
        const orderedTokens = pool.tokens.sort((a, b) => a.index - b.index);
        const poolTokens = orderedTokens.map(t => {
            if (!t.priceRate)
                throw new Error('Stable pool token does not have a price rate');
            const token = new Token(1, t.address, t.decimals, t.symbol, t.name);
            const tokenAmount = TokenAmount.fromHumanAmount(token, t.balance);
            return new StablePoolToken(token, tokenAmount.amount, unsafeFastParseEther(t.priceRate));
        });
        const amp = BigInt(pool.amp) * 1000n;
        const stablePool = new StablePool(pool.id, amp, BigInt(unsafeFastParseEther(pool.swapFee)), poolTokens);
        return stablePool;
    }
    constructor(id, amp, swapFee, tokens) {
        this.poolType = PoolType.ComposableStable;
        this.id = id;
        this.tokens = tokens;
        this.address = getPoolAddress(id);
        this.amp = amp;
        this.swapFee = swapFee;
        this.bptIndex = tokens.findIndex(t => t.token.address === this.address);
    }
    getNormalizedLiquidity(tokenIn, tokenOut) {
        const tIn = this.tokens.find(t => t.token.address === tokenIn.address);
        const tOut = this.tokens.find(t => t.token.address === tokenOut.address);
        if (!tIn || !tOut)
            throw new Error('Pool does not contain the tokens provided');
        // TODO: Fix stable normalized liquidity calc
        return tOut.amount * this.amp;
    }
    swapGivenIn(tokenIn, tokenOut, swapAmount) {
        if (tokenIn === this.tokens[this.bptIndex].token ||
            tokenOut === this.tokens[this.bptIndex].token) {
            throw new Error('BPT swap not implemented yet');
            // swapWithBpt()
        }
        else {
            const tokensNoBpt = [...this.tokens];
            tokensNoBpt.splice(this.bptIndex, 1);
            const tInIndex = tokensNoBpt.findIndex(t => t.token.address === tokenIn.address);
            const tOutIndex = tokensNoBpt.findIndex(t => t.token.address === tokenOut.address);
            if (tInIndex < 0 || tOutIndex < 0)
                throw new Error('Pool does not contain the tokens provided');
            if (swapAmount.amount > tokensNoBpt[tInIndex].amount)
                throw new Error('Swap amount exceeds the pool limit');
            const amountInWithFee = this.subtractSwapFeeAmount(swapAmount);
            const amountInWithRate = amountInWithFee.mulFixed(tokensNoBpt[tInIndex].rate);
            const balancesNoBpt = tokensNoBpt.map(t => t.scale18);
            const invariant = _calculateInvariant(this.amp, balancesNoBpt);
            const tokenOutScale18 = _calcOutGivenIn(this.amp, [...balancesNoBpt], tInIndex, tOutIndex, amountInWithRate.scale18, invariant);
            const amountOut = TokenAmount.fromScale18Amount(tokenOut, tokenOutScale18);
            const amountOutWithRate = amountOut.divDownFixed(tokensNoBpt[tOutIndex].rate);
            return amountOutWithRate;
        }
    }
    swapGivenOut(tokenIn, tokenOut, swapAmount) {
        if (tokenIn === this.tokens[this.bptIndex].token ||
            tokenOut === this.tokens[this.bptIndex].token) {
            throw new Error('BPT swap not implemented yet');
            // swapWithBpt()
        }
        else {
            const tokensNoBpt = [...this.tokens];
            tokensNoBpt.splice(this.bptIndex, 1);
            const tInIndex = tokensNoBpt.findIndex(t => t.token.address === tokenIn.address);
            const tOutIndex = tokensNoBpt.findIndex(t => t.token.address === tokenOut.address);
            if (tInIndex < 0 || tOutIndex < 0)
                throw new Error('Pool does not contain the tokens provided');
            if (swapAmount.amount > tokensNoBpt[tOutIndex].amount)
                throw new Error('Swap amount exceeds the pool limit');
            const amountOutWithRate = swapAmount.mulFixed(tokensNoBpt[tOutIndex].rate);
            const balancesNoBpt = tokensNoBpt.map(t => t.scale18);
            const invariant = _calculateInvariant(this.amp, balancesNoBpt);
            const tokenInScale18 = _calcInGivenOut(this.amp, [...balancesNoBpt], tInIndex, tOutIndex, amountOutWithRate.scale18, invariant);
            const amountIn = TokenAmount.fromScale18Amount(tokenIn, tokenInScale18, true);
            const amountInWithFee = this.addSwapFeeAmount(amountIn);
            const amountInWithRate = amountInWithFee.divDownFixed(tokensNoBpt[tInIndex].rate);
            return amountInWithRate;
        }
    }
    subtractSwapFeeAmount(amount) {
        const feeAmount = amount.mulFixed(this.swapFee);
        return amount.sub(feeAmount);
    }
    addSwapFeeAmount(amount) {
        return amount.divUpFixed(MathSol.complementFixed(this.swapFee));
    }
    getLimitAmountSwap(tokenIn, tokenOut, swapKind) {
        const tIn = this.tokens.find(t => t.token.address === tokenIn.address);
        const tOut = this.tokens.find(t => t.token.address === tokenOut.address);
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