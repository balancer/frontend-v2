import { Token } from './token';
import { HumanAmount } from '../types';
export type BigintIsh = bigint | string | number;
export declare class TokenAmount {
    readonly token: Token;
    readonly amount: bigint;
    readonly scalar: bigint;
    readonly decimalScale: bigint;
    readonly scale18: bigint;
    static fromRawAmount(token: Token, rawAmount: BigintIsh): TokenAmount;
    static fromHumanAmount(token: Token, humanAmount: HumanAmount): TokenAmount;
    static fromScale18Amount(token: Token, scale18Amount: BigintIsh, divUp?: boolean): TokenAmount;
    protected constructor(token: Token, amount: BigintIsh);
    add(other: TokenAmount): TokenAmount;
    sub(other: TokenAmount): TokenAmount;
    mulUpFixed(other: bigint): TokenAmount;
    mulDownFixed(other: bigint): TokenAmount;
    divUpFixed(other: bigint): TokenAmount;
    divDownFixed(other: bigint): TokenAmount;
    toSignificant(significantDigits?: number): string;
}
