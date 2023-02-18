import { unsafeFastParseEther } from './ether';
export const WAD = 1000000000000000000n;
export const RAY = 1000000000000000000000000000n;
export const TWO_WAD = 2000000000000000000n;
export const FOUR_WAD = 4000000000000000000n;
export const ALMOST_ONE = unsafeFastParseEther('0.99');
const _require = (b, message) => {
    if (!b)
        throw new Error(message);
};
export class MathSol {
    static max(a, b) {
        return a >= b ? a : b;
    }
    static min(a, b) {
        return a < b ? a : b;
    }
    static mulDownFixed(a, b) {
        const product = a * b;
        return product / WAD;
    }
    static mulUpFixed(a, b) {
        const product = a * b;
        if (product == 0n) {
            return 0n;
        }
        else {
            return (product - 1n) / WAD + 1n;
        }
    }
    static divDownFixed(a, b) {
        if (a == 0n) {
            return 0n;
        }
        else {
            const aInflated = a * WAD;
            return aInflated / b;
        }
    }
    static divUpFixed(a, b) {
        if (a == 0n) {
            return 0n;
        }
        else {
            const aInflated = a * WAD;
            return (aInflated - 1n) / b + 1n;
        }
    }
    static divUp(a, b) {
        if (a == 0n) {
            return 0n;
        }
        else {
            return 1n + (a - 1n) / b;
        }
    }
    // version = poolTypeVersion
    static powUpFixed(x, y, version) {
        if (y === WAD && version !== 1) {
            return x;
        }
        else if (y === TWO_WAD && version !== 1) {
            return this.mulUpFixed(x, x);
        }
        else if (y === FOUR_WAD && version !== 1) {
            const square = this.mulUpFixed(x, x);
            return this.mulUpFixed(square, square);
        }
        else {
            const raw = LogExpMath.pow(x, y);
            const maxError = this.mulUpFixed(raw, this.MAX_POW_RELATIVE_ERROR) + 1n;
            return raw + maxError;
        }
    }
    // version = poolTypeVersion
    static powDownFixed(x, y, version) {
        if (y === WAD && version !== 1) {
            return x;
        }
        else if (y === TWO_WAD && version !== 1) {
            return this.mulUpFixed(x, x);
        }
        else if (y === FOUR_WAD && version !== 1) {
            const square = this.mulUpFixed(x, x);
            return this.mulUpFixed(square, square);
        }
        else {
            const raw = LogExpMath.pow(x, y);
            const maxError = this.mulUpFixed(raw, this.MAX_POW_RELATIVE_ERROR) + 1n;
            if (raw < maxError) {
                return 0n;
            }
            else {
                return raw - maxError;
            }
        }
    }
    static complementFixed(x) {
        return x < WAD ? WAD - x : 0n;
    }
}
MathSol.MAX_POW_RELATIVE_ERROR = 10000n;
class LogExpMath {
    // All arguments and return values are 18 decimal fixed point numbers.
    static pow(x, y) {
        if (y === 0n) {
            // We solve the 0^0 indetermination by making it equal one.
            return this.ONE_18;
        }
        if (x == 0n) {
            return 0n;
        }
        // Instead of computing x^y directly, we instead rely on the properties of logarithms and exponentiation to
        // arrive at that result. In particular, exp(ln(x)) = x, and ln(x^y) = y * ln(x). This means
        // x^y = exp(y * ln(x)).
        // The ln function takes a signed value, so we need to make sure x fits in the signed 256 bit range.
        _require(x <
            BigInt('57896044618658097711785492504343953926634992332820282019728792003956564819968'), 'Errors.X_OUT_OF_BOUNDS');
        const x_int256 = x;
        // We will compute y * ln(x) in a single step. Depending on the value of x, we can either use ln or ln_36. In
        // both cases, we leave the division by ONE_18 (due to fixed point multiplication) to the end.
        // This prevents y * ln(x) from overflowing, and at the same time guarantees y fits in the signed 256 bit range.
        _require(y < this.MILD_EXPONENT_BOUND, 'Errors.Y_OUT_OF_BOUNDS');
        const y_int256 = y;
        let logx_times_y;
        if (this.LN_36_LOWER_BOUND < x_int256 && x_int256 < this.LN_36_UPPER_BOUND) {
            const ln_36_x = this._ln_36(x_int256);
            // ln_36_x has 36 decimal places, so multiplying by y_int256 isn't as straightforward, since we can't just
            // bring y_int256 to 36 decimal places, as it might overflow. Instead, we perform two 18 decimal
            // multiplications and add the results: one with the first 18 decimals of ln_36_x, and one with the
            // (downscaled) last 18 decimals.
            logx_times_y =
                (ln_36_x / this.ONE_18) * y_int256 +
                    ((ln_36_x % this.ONE_18) * y_int256) / this.ONE_18;
        }
        else {
            logx_times_y = this._ln(x_int256) * y_int256;
        }
        logx_times_y /= this.ONE_18;
        // Finally, we compute exp(y * ln(x)) to arrive at x^y
        _require(this.MIN_NATURAL_EXPONENT <= logx_times_y && logx_times_y <= this.MAX_NATURAL_EXPONENT, 'Errors.PRODUCT_OUT_OF_BOUNDS');
        // return uint256(exp(logx_times_y));
        return this.exp(logx_times_y);
    }
    static exp(x) {
        _require(x >= this.MIN_NATURAL_EXPONENT && x <= this.MAX_NATURAL_EXPONENT, 'Errors.INVALID_EXPONENT');
        if (x < 0) {
            // We only handle positive exponents: e^(-x) is computed as 1 / e^x. We can safely make x positive since it
            // fits in the signed 256 bit range (as it is larger than MIN_NATURAL_EXPONENT).
            // Fixed point division requires multiplying by ONE_18.
            return (this.ONE_18 * this.ONE_18) / this.exp(BigInt(-1) * x);
        }
        // First, we use the fact that e^(x+y) = e^x * e^y to decompose x into a sum of powers of two, which we call x_n,
        // where x_n == 2^(7 - n), and e^x_n = a_n has been precomputed. We choose the first x_n, x0, to equal 2^7
        // because all larger powers are larger than MAX_NATURAL_EXPONENT, and therefore not present in the
        // decomposition.
        // At the end of this process we will have the product of all e^x_n = a_n that apply, and the remainder of this
        // decomposition, which will be lower than the smallest x_n.
        // exp(x) = k_0 * a_0 * k_1 * a_1 * ... + k_n * a_n * exp(remainder), where each k_n equals either 0 or 1.
        // We mutate x by subtracting x_n, making it the remainder of the decomposition.
        // The first two a_n (e^(2^7) and e^(2^6)) are too large if stored as 18 decimal numbers, and could cause
        // intermediate overflows. Instead we store them as plain integers, with 0 decimals.
        // Additionally, x0 + x1 is larger than MAX_NATURAL_EXPONENT, which means they will not both be present in the
        // decomposition.
        // For each x_n, we test if that term is present in the decomposition (if x is larger than it), and if so deduct
        // it and compute the accumulated product.
        let firstAN;
        if (x >= this.x0) {
            x -= this.x0;
            firstAN = this.a0;
        }
        else if (x >= this.x1) {
            x -= this.x1;
            firstAN = this.a1;
        }
        else {
            firstAN = BigInt(1); // One with no decimal places
        }
        // We now transform x into a 20 decimal fixed point number, to have enhanced precision when computing the
        // smaller terms.
        x *= BigInt(100);
        // `product` is the accumulated product of all a_n (except a0 and a1), which starts at 20 decimal fixed point
        // one. Recall that fixed point multiplication requires dividing by ONE_20.
        let product = this.ONE_20;
        if (x >= this.x2) {
            x -= this.x2;
            product = (product * this.a2) / this.ONE_20;
        }
        if (x >= this.x3) {
            x -= this.x3;
            product = (product * this.a3) / this.ONE_20;
        }
        if (x >= this.x4) {
            x -= this.x4;
            product = (product * this.a4) / this.ONE_20;
        }
        if (x >= this.x5) {
            x -= this.x5;
            product = (product * this.a5) / this.ONE_20;
        }
        if (x >= this.x6) {
            x -= this.x6;
            product = (product * this.a6) / this.ONE_20;
        }
        if (x >= this.x7) {
            x -= this.x7;
            product = (product * this.a7) / this.ONE_20;
        }
        if (x >= this.x8) {
            x -= this.x8;
            product = (product * this.a8) / this.ONE_20;
        }
        if (x >= this.x9) {
            x -= this.x9;
            product = (product * this.a9) / this.ONE_20;
        }
        // x10 and x11 are unnecessary here since we have high enough precision already.
        // Now we need to compute e^x, where x is small (in particular, it is smaller than x9). We use the Taylor series
        // expansion for e^x: 1 + x + (x^2 / 2!) + (x^3 / 3!) + ... + (x^n / n!).
        let seriesSum = this.ONE_20; // The initial one in the sum, with 20 decimal places.
        let term; // Each term in the sum, where the nth term is (x^n / n!).
        // The first term is simply x.
        term = x;
        seriesSum += term;
        // Each term (x^n / n!) equals the previous one times x, divided by n. Since x is a fixed point number,
        // multiplying by it requires dividing by this.ONE_20, but dividing by the non-fixed point n values does not.
        term = (term * x) / this.ONE_20 / BigInt(2);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(3);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(4);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(5);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(6);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(7);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(8);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(9);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(10);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(11);
        seriesSum += term;
        term = (term * x) / this.ONE_20 / BigInt(12);
        seriesSum += term;
        // 12 Taylor terms are sufficient for 18 decimal precision.
        // We now have the first a_n (with no decimals), and the product of all other a_n present, and the Taylor
        // approximation of the exponentiation of the remainder (both with 20 decimals). All that remains is to multiply
        // all three (one 20 decimal fixed point multiplication, dividing by this.ONE_20, and one integer multiplication),
        // and then drop two digits to return an 18 decimal value.
        return (((product * seriesSum) / this.ONE_20) * firstAN) / BigInt(100);
    }
    static _ln_36(x) {
        // Since ln(1) = 0, a value of x close to one will yield a very small result, which makes using 36 digits
        // worthwhile.
        // First, we transform x to a 36 digit fixed point value.
        x *= this.ONE_18;
        // We will use the following Taylor expansion, which converges very rapidly. Let z = (x - 1) / (x + 1).
        // ln(x) = 2 * (z + z^3 / 3 + z^5 / 5 + z^7 / 7 + ... + z^(2 * n + 1) / (2 * n + 1))
        // Recall that 36 digit fixed point division requires multiplying by ONE_36, and multiplication requires
        // division by ONE_36.
        const z = ((x - this.ONE_36) * this.ONE_36) / (x + this.ONE_36);
        const z_squared = (z * z) / this.ONE_36;
        // num is the numerator of the series: the z^(2 * n + 1) term
        let num = z;
        // seriesSum holds the accumulated sum of each term in the series, starting with the initial z
        let seriesSum = num;
        // In each step, the numerator is multiplied by z^2
        num = (num * z_squared) / this.ONE_36;
        seriesSum += num / BigInt(3);
        num = (num * z_squared) / this.ONE_36;
        seriesSum += num / BigInt(5);
        num = (num * z_squared) / this.ONE_36;
        seriesSum += num / BigInt(7);
        num = (num * z_squared) / this.ONE_36;
        seriesSum += num / BigInt(9);
        num = (num * z_squared) / this.ONE_36;
        seriesSum += num / BigInt(11);
        num = (num * z_squared) / this.ONE_36;
        seriesSum += num / BigInt(13);
        num = (num * z_squared) / this.ONE_36;
        seriesSum += num / BigInt(15);
        // 8 Taylor terms are sufficient for 36 decimal precision.
        // All that remains is multiplying by 2 (non fixed point).
        return seriesSum * BigInt(2);
    }
    /**
     * @dev Internal natural logarithm (ln(a)) with signed 18 decimal fixed point argument.
     */
    static _ln(a) {
        if (a < this.ONE_18) {
            // Since ln(a^k) = k * ln(a), we can compute ln(a) as ln(a) = ln((1/a)^(-1)) = - ln((1/a)). If a is less
            // than one, 1/a will be greater than one, and this if statement will not be entered in the recursive call.
            // Fixed point division requires multiplying by this.ONE_18.
            return BigInt(-1) * this._ln((this.ONE_18 * this.ONE_18) / a);
        }
        // First, we use the fact that ln^(a * b) = ln(a) + ln(b) to decompose ln(a) into a sum of powers of two, which
        // we call x_n, where x_n == 2^(7 - n), which are the natural logarithm of precomputed quantities a_n (that is,
        // ln(a_n) = x_n). We choose the first x_n, x0, to equal 2^7 because the exponential of all larger powers cannot
        // be represented as 18 fixed point decimal numbers in 256 bits, and are therefore larger than a.
        // At the end of this process we will have the sum of all x_n = ln(a_n) that apply, and the remainder of this
        // decomposition, which will be lower than the smallest a_n.
        // ln(a) = k_0 * x_0 + k_1 * x_1 + ... + k_n * x_n + ln(remainder), where each k_n equals either 0 or 1.
        // We mutate a by subtracting a_n, making it the remainder of the decomposition.
        // For reasons related to how `exp` works, the first two a_n (e^(2^7) and e^(2^6)) are not stored as fixed point
        // numbers with 18 decimals, but instead as plain integers with 0 decimals, so we need to multiply them by
        // this.ONE_18 to convert them to fixed point.
        // For each a_n, we test if that term is present in the decomposition (if a is larger than it), and if so divide
        // by it and compute the accumulated sum.
        let sum = 0n;
        if (a >= this.a0 * this.ONE_18) {
            a /= this.a0; // Integer, not fixed point division
            sum += this.x0;
        }
        if (a >= this.a1 * this.ONE_18) {
            a /= this.a1; // Integer, not fixed point division
            sum += this.x1;
        }
        // All other a_n and x_n are stored as 20 digit fixed point numbers, so we convert the sum and a to this format.
        sum *= BigInt(100);
        a *= BigInt(100);
        // Because further a_n are  20 digit fixed point numbers, we multiply by ONE_20 when dividing by them.
        if (a >= this.a2) {
            a = (a * this.ONE_20) / this.a2;
            sum += this.x2;
        }
        if (a >= this.a3) {
            a = (a * this.ONE_20) / this.a3;
            sum += this.x3;
        }
        if (a >= this.a4) {
            a = (a * this.ONE_20) / this.a4;
            sum += this.x4;
        }
        if (a >= this.a5) {
            a = (a * this.ONE_20) / this.a5;
            sum += this.x5;
        }
        if (a >= this.a6) {
            a = (a * this.ONE_20) / this.a6;
            sum += this.x6;
        }
        if (a >= this.a7) {
            a = (a * this.ONE_20) / this.a7;
            sum += this.x7;
        }
        if (a >= this.a8) {
            a = (a * this.ONE_20) / this.a8;
            sum += this.x8;
        }
        if (a >= this.a9) {
            a = (a * this.ONE_20) / this.a9;
            sum += this.x9;
        }
        if (a >= this.a10) {
            a = (a * this.ONE_20) / this.a10;
            sum += this.x10;
        }
        if (a >= this.a11) {
            a = (a * this.ONE_20) / this.a11;
            sum += this.x11;
        }
        // a is now a small number (smaller than a_11, which roughly equals 1.06). This means we can use a Taylor series
        // that converges rapidly for values of `a` close to one - the same one used in ln_36.
        // Let z = (a - 1) / (a + 1).
        // ln(a) = 2 * (z + z^3 / 3 + z^5 / 5 + z^7 / 7 + ... + z^(2 * n + 1) / (2 * n + 1))
        // Recall that 20 digit fixed point division requires multiplying by ONE_20, and multiplication requires
        // division by ONE_20.
        const z = ((a - this.ONE_20) * this.ONE_20) / (a + this.ONE_20);
        const z_squared = (z * z) / this.ONE_20;
        // num is the numerator of the series: the z^(2 * n + 1) term
        let num = z;
        // seriesSum holds the accumulated sum of each term in the series, starting with the initial z
        let seriesSum = num;
        // In each step, the numerator is multiplied by z^2
        num = (num * z_squared) / this.ONE_20;
        seriesSum += num / BigInt(3);
        num = (num * z_squared) / this.ONE_20;
        seriesSum += num / BigInt(5);
        num = (num * z_squared) / this.ONE_20;
        seriesSum += num / BigInt(7);
        num = (num * z_squared) / this.ONE_20;
        seriesSum += num / BigInt(9);
        num = (num * z_squared) / this.ONE_20;
        seriesSum += num / BigInt(11);
        // 6 Taylor terms are sufficient for 36 decimal precision.
        // Finally, we multiply by 2 (non fixed point) to compute ln(remainder)
        seriesSum *= BigInt(2);
        // We now have the sum of all x_n present, and the Taylor approximation of the logarithm of the remainder (both
        // with 20 decimals). All that remains is to sum these two, and then drop two digits to return a 18 decimal
        // value.
        return (sum + seriesSum) / BigInt(100);
    }
}
// All fixed point multiplications and divisions are inlined. This means we need to divide by ONE when multiplying
// two numbers, and multiply by ONE when dividing them.
// All arguments and return values are 18 decimal fixed point numbers.
LogExpMath.ONE_18 = BigInt('1000000000000000000');
// Internally, intermediate values are computed with higher precision as 20 decimal fixed point numbers, and in the
// case of ln36, 36 decimals.
LogExpMath.ONE_20 = BigInt('100000000000000000000');
LogExpMath.ONE_36 = BigInt('1000000000000000000000000000000000000');
// The domain of natural exponentiation is bound by the word size and number of decimals used.
//
// Because internally the result will be stored using 20 decimals, the largest possible result is
// (2^255 - 1) / 10^20, which makes the largest exponent ln((2^255 - 1) / 10^20) = 130.700829182905140221.
// The smallest possible result is 10^(-18), which makes largest negative argument
// ln(10^(-18)) = -41.446531673892822312.
// We use 130.0 and -41.0 to have some safety margin.
LogExpMath.MAX_NATURAL_EXPONENT = BigInt('130000000000000000000');
LogExpMath.MIN_NATURAL_EXPONENT = BigInt('-41000000000000000000');
// Bounds for ln_36's argument. Both ln(0.9) and ln(1.1) can be represented with 36 decimal places in a fixed point
// 256 bit integer.
LogExpMath.LN_36_LOWER_BOUND = BigInt(LogExpMath.ONE_18) - BigInt('100000000000000000');
LogExpMath.LN_36_UPPER_BOUND = BigInt(LogExpMath.ONE_18) + BigInt('100000000000000000');
LogExpMath.MILD_EXPONENT_BOUND = BigInt(2) ** BigInt(254) / LogExpMath.ONE_20;
// 18 decimal constants
LogExpMath.x0 = BigInt('128000000000000000000'); // 2ˆ7
LogExpMath.a0 = BigInt('38877084059945950922200000000000000000000000000000000000'); // eˆ(x0) (no decimals)
LogExpMath.x1 = BigInt('64000000000000000000'); // 2ˆ6
LogExpMath.a1 = BigInt('6235149080811616882910000000'); // eˆ(x1) (no decimals)
// 20 decimal constants
LogExpMath.x2 = BigInt('3200000000000000000000'); // 2ˆ5
LogExpMath.a2 = BigInt('7896296018268069516100000000000000'); // eˆ(x2)
LogExpMath.x3 = BigInt('1600000000000000000000'); // 2ˆ4
LogExpMath.a3 = BigInt('888611052050787263676000000'); // eˆ(x3)
LogExpMath.x4 = BigInt('800000000000000000000'); // 2ˆ3
LogExpMath.a4 = BigInt('298095798704172827474000'); // eˆ(x4)
LogExpMath.x5 = BigInt('400000000000000000000'); // 2ˆ2
LogExpMath.a5 = BigInt('5459815003314423907810'); // eˆ(x5)
LogExpMath.x6 = BigInt('200000000000000000000'); // 2ˆ1
LogExpMath.a6 = BigInt('738905609893065022723'); // eˆ(x6)
LogExpMath.x7 = BigInt('100000000000000000000'); // 2ˆ0
LogExpMath.a7 = BigInt('271828182845904523536'); // eˆ(x7)
LogExpMath.x8 = BigInt('50000000000000000000'); // 2ˆ-1
LogExpMath.a8 = BigInt('164872127070012814685'); // eˆ(x8)
LogExpMath.x9 = BigInt('25000000000000000000'); // 2ˆ-2
LogExpMath.a9 = BigInt('128402541668774148407'); // eˆ(x9)
LogExpMath.x10 = BigInt('12500000000000000000'); // 2ˆ-3
LogExpMath.a10 = BigInt('113314845306682631683'); // eˆ(x10)
LogExpMath.x11 = BigInt('6250000000000000000'); // 2ˆ-4
LogExpMath.a11 = BigInt('106449445891785942956'); // eˆ(x11)
//# sourceMappingURL=math.js.map