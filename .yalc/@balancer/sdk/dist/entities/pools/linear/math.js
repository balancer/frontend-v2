import { MathSol, WAD } from '../../../utils/';
export function _calcWrappedOutPerMainIn(mainIn, mainBalance, params) {
    // Amount out, so we round down overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(mainBalance + mainIn, params);
    return afterNominalMain - previousNominalMain;
}
export function _calcBptOutPerMainIn(mainIn, mainBalance, wrappedBalance, bptSupply, params) {
    // Amount out, so we round down overall.
    if (bptSupply == 0n) {
        return _toNominal(mainIn, params);
    }
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(mainBalance + mainIn, params);
    const deltaNominalMain = afterNominalMain - previousNominalMain;
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    return (bptSupply * deltaNominalMain) / invariant;
}
export function _calcMainOutPerWrappedIn(wrappedIn, mainBalance, params) {
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = previousNominalMain - wrappedIn;
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return mainBalance - newMainBalance;
}
export function _calcBptOutPerWrappedIn(wrappedIn, mainBalance, wrappedBalance, bptSupply, params) {
    if (bptSupply === 0n) {
        return wrappedIn;
    }
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newWrappedBalance = wrappedBalance + wrappedIn;
    const newInvariant = _calcInvariant(nominalMain, newWrappedBalance);
    const newBptBalance = (bptSupply * newInvariant) / previousInvariant;
    return newBptBalance - bptSupply;
}
export function _calcMainOutPerBptIn(bptIn, mainBalance, wrappedBalance, bptSupply, params) {
    // Amount out, so we round down overall.
    const previousNominalMain = _toNominal(mainBalance, params);
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    const deltaNominalMain = (invariant * bptIn) / bptSupply;
    const afterNominalMain = previousNominalMain - deltaNominalMain;
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return mainBalance - newMainBalance;
}
export function _calcWrappedOutPerBptIn(bptIn, mainBalance, wrappedBalance, bptSupply, params) {
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newBptBalance = bptSupply - bptIn;
    const newWrappedBalance = (newBptBalance * previousInvariant) / bptSupply - nominalMain;
    return wrappedBalance - newWrappedBalance;
}
export function _calcMainInPerWrappedOut(wrappedOut, mainBalance, params) {
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = previousNominalMain + wrappedOut;
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return newMainBalance - mainBalance;
}
export function _calcMainInPerBptOut(bptOut, mainBalance, wrappedBalance, bptSupply, params) {
    if (bptSupply == 0n) {
        return _fromNominal(bptOut, params);
    }
    const previousNominalMain = _toNominal(mainBalance, params);
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    const deltaNominalMain = (invariant * bptOut) / bptSupply;
    const afterNominalMain = previousNominalMain + deltaNominalMain;
    const newMainBalance = _fromNominal(afterNominalMain, params);
    return newMainBalance - mainBalance;
}
export function _calcWrappedInPerMainOut(mainOut, mainBalance, params) {
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(mainBalance - mainOut, params);
    return previousNominalMain - afterNominalMain;
}
export function _calcWrappedInPerBptOut(bptOut, mainBalance, wrappedBalance, bptSupply, params) {
    if (bptSupply == 0n) {
        return bptOut;
    }
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newBptBalance = bptSupply + bptOut;
    const newWrappedBalance = (newBptBalance * previousInvariant) / bptSupply - nominalMain;
    return newWrappedBalance - wrappedBalance;
}
export function _calcBptInPerWrappedOut(wrappedOut, mainBalance, wrappedBalance, bptSupply, params) {
    const nominalMain = _toNominal(mainBalance, params);
    const previousInvariant = _calcInvariant(nominalMain, wrappedBalance);
    const newWrappedBalance = wrappedBalance - wrappedOut;
    const newInvariant = _calcInvariant(nominalMain, newWrappedBalance);
    const newBptBalance = (bptSupply * newInvariant) / previousInvariant;
    return bptSupply - newBptBalance;
}
export function _calcBptInPerMainOut(mainOut, mainBalance, wrappedBalance, bptSupply, params) {
    const previousNominalMain = _toNominal(mainBalance, params);
    const afterNominalMain = _toNominal(mainBalance - mainOut, params);
    const deltaNominalMain = previousNominalMain - afterNominalMain;
    const invariant = _calcInvariant(previousNominalMain, wrappedBalance);
    return (bptSupply * deltaNominalMain) / invariant;
}
function _calcInvariant(nominalMainBalance, wrappedBalance) {
    return nominalMainBalance + wrappedBalance;
}
function _toNominal(real, params) {
    // Fees are always rounded down: either direction would work but we need to be consistent, and rounding down
    // uses less gas.
    if (real < params.lowerTarget) {
        const fees = MathSol.mulDownFixed(params.lowerTarget - real, params.fee);
        return real - fees;
    }
    else if (real <= params.upperTarget) {
        return real;
    }
    else {
        const fees = MathSol.mulDownFixed(real - params.upperTarget, params.fee);
        return real - fees;
    }
}
function _fromNominal(nominal, params) {
    // Since real = nominal + fees, rounding down fees is equivalent to rounding down real.
    if (nominal < params.lowerTarget) {
        return MathSol.divDownFixed(nominal + MathSol.mulDownFixed(params.fee, params.lowerTarget), WAD + params.fee);
    }
    else if (nominal <= params.upperTarget) {
        return nominal;
    }
    else {
        return MathSol.divDownFixed(nominal - MathSol.mulDownFixed(params.fee, params.upperTarget), WAD - params.fee);
    }
}
//# sourceMappingURL=math.js.map