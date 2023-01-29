import { MathSol, WAD } from '../../../utils/math';
export function _calcOutGivenIn(balanceIn, weightIn, balanceOut, weightOut, amountIn, version) {
    const denominator = balanceIn + amountIn;
    const base = MathSol.divUpFixed(balanceIn, denominator);
    const exponent = MathSol.divDownFixed(weightIn, weightOut);
    const power = MathSol.powUpFixed(base, exponent, version);
    return MathSol.mulDownFixed(balanceOut, MathSol.complementFixed(power));
}
export function _calcInGivenOut(balanceIn, weightIn, balanceOut, weightOut, amountOut, version) {
    const base = MathSol.divUpFixed(balanceOut, balanceOut - amountOut);
    const exponent = MathSol.divUpFixed(weightOut, weightIn);
    const power = MathSol.powUpFixed(base, exponent, version);
    const ratio = power - WAD;
    return MathSol.mulUpFixed(balanceIn, ratio);
}
//# sourceMappingURL=math.js.map