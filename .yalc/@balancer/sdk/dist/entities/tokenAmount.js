import _Decimal from 'decimal.js-light';
import { unsafeFastParseUnits, WAD } from '../utils';
export class TokenAmount {
    static fromRawAmount(token, rawAmount) {
        return new TokenAmount(token, rawAmount);
    }
    static fromHumanAmount(token, humanAmount) {
        const rawAmount = unsafeFastParseUnits(humanAmount, token.decimals);
        return new TokenAmount(token, rawAmount);
    }
    static fromScale18Amount(token, scale18Amount, divUp) {
        const scalar = BigInt(10) ** BigInt(18 - token.decimals);
        const rawAmount = divUp
            ? 1n + (BigInt(scale18Amount) - 1n) / scalar
            : BigInt(scale18Amount) / scalar;
        return new TokenAmount(token, rawAmount);
    }
    constructor(token, amount) {
        this.decimalScale = BigInt(10) ** BigInt(token.decimals);
        this.token = token;
        this.amount = BigInt(amount);
        this.scalar = BigInt(10) ** BigInt(18 - token.decimals);
        this.scale18 = this.amount * this.scalar;
    }
    add(other) {
        return new TokenAmount(this.token, this.amount + other.amount);
    }
    sub(other) {
        return new TokenAmount(this.token, this.amount - other.amount);
    }
    mulUpFixed(other) {
        const product = this.amount * other;
        const multiplied = (product - 1n) / WAD + 1n;
        return new TokenAmount(this.token, multiplied);
    }
    mulDownFixed(other) {
        const multiplied = (this.amount * other) / WAD;
        return new TokenAmount(this.token, multiplied);
    }
    divUpFixed(other) {
        const divided = (this.amount * WAD + other - 1n) / other;
        return new TokenAmount(this.token, divided);
    }
    divDownFixed(other) {
        const divided = (this.amount * WAD) / other;
        return new TokenAmount(this.token, divided);
    }
    toSignificant(significantDigits = 6) {
        return new _Decimal(this.amount.toString())
            .div(new _Decimal(this.decimalScale.toString()))
            .toDecimalPlaces(significantDigits)
            .toString();
    }
}
//# sourceMappingURL=tokenAmount.js.map