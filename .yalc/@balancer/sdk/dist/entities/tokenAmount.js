import { parseUnits } from '@ethersproject/units';
import _Decimal from 'decimal.js-light';
import { WAD } from '../utils';
export class TokenAmount {
    static fromRawAmount(token, rawAmount) {
        return new TokenAmount(token, rawAmount);
    }
    static fromHumanAmount(token, humanAmount) {
        const rawAmount = parseUnits(humanAmount, token.decimals).toString();
        return new TokenAmount(token, rawAmount);
    }
    static fromScale18Amount(token, scale18Amount) {
        const scalar = BigInt(10) ** BigInt(18 - token.decimals);
        const rawAmount = BigInt(scale18Amount) / scalar;
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
    mulFixed(other) {
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