import { PoolType, SwapKind } from '../../../types';
import { Token, TokenAmount } from '../../';
import { getPoolAddress, MAX_UINT256, unsafeFastParseEther, WAD } from '../../../utils';
import { _calcBptOutPerMainIn, _calcBptOutPerWrappedIn, _calcMainOutPerBptIn, _calcMainOutPerWrappedIn, _calcWrappedOutPerBptIn, _calcWrappedOutPerMainIn, _calcMainInPerWrappedOut, _calcMainInPerBptOut, _calcWrappedInPerMainOut, _calcWrappedInPerBptOut, _calcBptInPerWrappedOut, _calcBptInPerMainOut, } from './math';
const ALMOST_ONE = BigInt(unsafeFastParseEther('0.99'));
const ONE = BigInt(unsafeFastParseEther('1'));
const MAX_RATIO = BigInt(unsafeFastParseEther('10'));
const MAX_TOKEN_BALANCE = MAX_UINT256 - 1n;
export class BPT extends TokenAmount {
    constructor(token, amount) {
        super(token, amount);
        this.rate = 1n;
        this.virtualBalance = MAX_UINT256 - this.amount;
    }
}
export class WrappedToken extends TokenAmount {
    constructor(token, amount, rate) {
        super(token, amount);
        this.rate = BigInt(rate);
        this.scale18 = (this.amount * this.scalar * this.rate) / WAD;
    }
}
export class LinearPool {
    static fromRawPool(pool) {
        const orderedTokens = pool.tokens.sort((a, b) => a.index - b.index);
        const swapFee = BigInt(unsafeFastParseEther(pool.swapFee).toString());
        const mT = orderedTokens[pool.mainIndex];
        const mToken = new Token(1, mT.address, mT.decimals, mT.symbol, mT.name);
        const lowerTarget = TokenAmount.fromHumanAmount(mToken, pool.lowerTarget);
        const upperTarget = TokenAmount.fromHumanAmount(mToken, pool.upperTarget);
        const mTokenAmount = TokenAmount.fromHumanAmount(mToken, mT.balance);
        const wT = orderedTokens[pool.wrappedIndex];
        const wTRate = BigInt(unsafeFastParseEther(wT.priceRate || '1.0').toString());
        const wToken = new Token(1, wT.address, wT.decimals, wT.symbol, wT.name);
        const wTokenAmount = TokenAmount.fromHumanAmount(wToken, wT.balance);
        const wrappedToken = new WrappedToken(wToken, wTokenAmount.amount, wTRate);
        const bptIndex = orderedTokens.findIndex(t => t.address === pool.address);
        const bT = orderedTokens[bptIndex];
        const bToken = new Token(1, bT.address, bT.decimals, bT.symbol, bT.name);
        const bTokenAmount = TokenAmount.fromHumanAmount(bToken, bT.balance);
        const bptToken = new BPT(bToken, bTokenAmount.amount);
        const tokens = [mTokenAmount, wrappedToken, bptToken];
        const params = {
            fee: swapFee,
            rate: wTRate,
            lowerTarget: lowerTarget.scale18,
            upperTarget: upperTarget.scale18,
        };
        const linearPool = new LinearPool(pool.id, pool.poolTypeVersion, tokens, params, mTokenAmount, wrappedToken, bptToken);
        return linearPool;
    }
    constructor(id, poolTypeVersion, tokens, params, mainToken, wrappedToken, bptToken) {
        this.poolType = PoolType.AaveLinear;
        this.id = id;
        this.poolTypeVersion = poolTypeVersion;
        this.swapFee = params.fee;
        this.tokens = tokens;
        this.mainToken = mainToken;
        this.wrappedToken = wrappedToken;
        this.bptToken = bptToken;
        this.address = getPoolAddress(id);
        this.params = params;
    }
    getNormalizedLiquidity(tokenIn, tokenOut) {
        const tIn = this.tokens.find(t => t.token.address === tokenIn.address);
        const tOut = this.tokens.find(t => t.token.address === tokenOut.address);
        if (!tIn || !tOut)
            throw new Error('Pool does not contain the tokens provided');
        // TODO: Fix linear normalized liquidity calc
        return tOut.amount;
    }
    swapGivenIn(tokenIn, tokenOut, swapAmount) {
        const tInIndex = this.tokens.findIndex(t => t.token.address === tokenIn.address);
        if (swapAmount.amount > this.tokens[tInIndex].amount)
            throw new Error('Swap amount exceeds the pool limit');
        if (tokenIn.isEqual(this.mainToken.token)) {
            if (tokenOut.isEqual(this.wrappedToken.token)) {
                return this._exactMainTokenInForWrappedOut(swapAmount);
            }
            else {
                return this._exactMainTokenInForBptOut(swapAmount);
            }
        }
        else if (tokenIn.isEqual(this.wrappedToken.token)) {
            if (tokenOut.isEqual(this.mainToken.token)) {
                return this._exactWrappedTokenInForMainOut(swapAmount);
            }
            else {
                return this._exactWrappedTokenInForBptOut(swapAmount);
            }
        }
        else if (tokenIn.isEqual(this.bptToken.token)) {
            if (tokenOut.isEqual(this.mainToken.token)) {
                return this._exactBptInForMainOut(swapAmount);
            }
            else {
                return this._exactBptInForWrappedOut(swapAmount);
            }
        }
        else {
            throw new Error('Pool does not contain the tokens provided');
        }
    }
    swapGivenOut(tokenIn, tokenOut, swapAmount) {
        const tOutIndex = this.tokens.findIndex(t => t.token.address === tokenOut.address);
        if (swapAmount.amount > this.tokens[tOutIndex].amount)
            throw new Error('Swap amount exceeds the pool limit');
        if (tokenIn.isEqual(this.mainToken.token)) {
            if (tokenOut.isEqual(this.wrappedToken.token)) {
                return this._mainTokenInForExactWrappedOut(swapAmount);
            }
            else {
                return this._mainTokenInForExactBptOut(swapAmount);
            }
        }
        else if (tokenIn.isEqual(this.wrappedToken.token)) {
            if (tokenOut.isEqual(this.mainToken.token)) {
                return this._wrappedTokenInForExactMainOut(swapAmount);
            }
            else {
                return this._wrappedTokenInForExactBptOut(swapAmount);
            }
        }
        else if (tokenIn.isEqual(this.bptToken.token)) {
            if (tokenOut.isEqual(this.mainToken.token)) {
                return this._bptInForExactMainOut(swapAmount);
            }
            else {
                return this._bptInForExactWrappedOut(swapAmount);
            }
        }
        else {
            throw new Error('Pool does not contain the tokens provided');
        }
    }
    getLimitAmountSwap(tokenIn, tokenOut, swapKind) {
        const tIn = this.tokens.find(t => t.token.address === tokenIn.address);
        const tOut = this.tokens.find(t => t.token.address === tokenOut.address);
        if (!tIn || !tOut)
            throw new Error('Pool does not contain the tokens provided');
        if (swapKind === SwapKind.GivenIn) {
            if (tokenOut.isEqual(this.bptToken.token)) {
                // Swapping to BPT allows for a very large amount so using pre-minted amount as estimation
                return MAX_TOKEN_BALANCE;
            }
            else {
                const amount = TokenAmount.fromRawAmount(tokenOut, (tOut.amount * ALMOST_ONE) / ONE);
                return this.swapGivenOut(tokenIn, tokenOut, amount).amount;
            }
        }
        else {
            if (tokenOut.isEqual(this.bptToken.token)) {
                return (tOut.amount * MAX_RATIO) / ONE;
            }
            else {
                return (tOut.amount * ALMOST_ONE) / ONE;
            }
        }
    }
    _exactMainTokenInForWrappedOut(swapAmount) {
        const tokenOutScale18 = _calcWrappedOutPerMainIn(swapAmount.scale18, this.mainToken.scale18, this.params);
        return TokenAmount.fromScale18Amount(this.wrappedToken.token, tokenOutScale18);
    }
    _exactMainTokenInForBptOut(swapAmount) {
        const tokenOutScale18 = _calcBptOutPerMainIn(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.bptToken.token, tokenOutScale18);
    }
    _exactWrappedTokenInForMainOut(swapAmount) {
        const tokenOutScale18 = _calcMainOutPerWrappedIn(swapAmount.scale18, this.mainToken.scale18, this.params);
        return TokenAmount.fromScale18Amount(this.mainToken.token, tokenOutScale18);
    }
    _exactWrappedTokenInForBptOut(swapAmount) {
        const tokenOutScale18 = _calcBptOutPerWrappedIn(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.bptToken.token, tokenOutScale18);
    }
    _exactBptInForMainOut(swapAmount) {
        const tokenOutScale18 = _calcMainOutPerBptIn(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.mainToken.token, tokenOutScale18);
    }
    _exactBptInForWrappedOut(swapAmount) {
        const tokenOutScale18 = _calcWrappedOutPerBptIn(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.wrappedToken.token, tokenOutScale18);
    }
    _mainTokenInForExactWrappedOut(swapAmount) {
        const tokenOutScale18 = _calcMainInPerWrappedOut(swapAmount.scale18, this.mainToken.scale18, this.params);
        return TokenAmount.fromScale18Amount(this.mainToken.token, tokenOutScale18, true);
    }
    _mainTokenInForExactBptOut(swapAmount) {
        const tokenOutScale18 = _calcMainInPerBptOut(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.mainToken.token, tokenOutScale18, true);
    }
    _wrappedTokenInForExactMainOut(swapAmount) {
        const tokenOutScale18 = _calcWrappedInPerMainOut(swapAmount.scale18, this.mainToken.scale18, this.params);
        return TokenAmount.fromScale18Amount(this.wrappedToken.token, tokenOutScale18, true);
    }
    _wrappedTokenInForExactBptOut(swapAmount) {
        const tokenOutScale18 = _calcWrappedInPerBptOut(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.wrappedToken.token, tokenOutScale18, true);
    }
    _bptInForExactMainOut(swapAmount) {
        const tokenOutScale18 = _calcBptInPerMainOut(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.bptToken.token, tokenOutScale18, true);
    }
    _bptInForExactWrappedOut(swapAmount) {
        const tokenOutScale18 = _calcBptInPerWrappedOut(swapAmount.scale18, this.mainToken.scale18, this.wrappedToken.scale18, this.bptToken.virtualBalance, this.params);
        return TokenAmount.fromScale18Amount(this.bptToken.token, tokenOutScale18, true);
    }
}
//# sourceMappingURL=index.js.map