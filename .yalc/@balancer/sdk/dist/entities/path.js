import { SwapKind } from '../types';
export class Path {
    constructor(tokens, pools) {
        if (pools.length === 0 || tokens.length < 2) {
            throw new Error('Invalid path: must contain at least 1 pool and 2 tokens.');
        }
        else if (tokens.length !== pools.length + 1) {
            throw new Error('Invalid path: tokens length must equal pools length + 1');
        }
        this.pools = pools;
        this.tokens = tokens;
    }
}
export class PathWithAmount extends Path {
    constructor(tokens, pools, swapAmount) {
        super(tokens, pools);
        this.swapAmount = swapAmount;
        //call to super ensures this array access is safe
        if (tokens[0].address === swapAmount.token.wrapped) {
            this.swapKind = SwapKind.GivenIn;
        }
        else {
            this.swapKind = SwapKind.GivenOut;
        }
        try {
            this.outputAmount = this.calcOutputAmount();
            this.inputAmount = this.calcInputAmount();
        }
        catch (error) {
            throw new Error(`Invalid path, swap amount exceeds maximum for pool`);
        }
    }
    calcOutputAmount() {
        if (this.swapKind === SwapKind.GivenIn) {
            const amounts = new Array(this.tokens.length);
            amounts[0] = this.swapAmount;
            for (let i = 0; i < this.pools.length; i++) {
                const pool = this.pools[i];
                const outputAmount = pool.swapGivenIn(this.tokens[i], this.tokens[i + 1], amounts[i]);
                amounts[i + 1] = outputAmount;
            }
            const outputAmount = amounts[amounts.length - 1];
            return outputAmount;
        }
        else {
            return this.swapAmount;
        }
    }
    calcInputAmount() {
        if (this.swapKind === SwapKind.GivenOut) {
            const amounts = new Array(this.tokens.length);
            amounts[amounts.length - 1] = this.swapAmount;
            for (let i = this.pools.length; i >= 1; i--) {
                const pool = this.pools[i - 1];
                const inputAmount = pool.swapGivenOut(this.tokens[i - 1], this.tokens[i], amounts[i]);
                amounts[i - 1] = inputAmount;
            }
            const inputAmount = amounts[0];
            return inputAmount;
        }
        else {
            return this.swapAmount;
        }
    }
    print() {
        // TODO: cleanup
        const printPath = [];
        if (this.swapKind === SwapKind.GivenIn) {
            const amounts = new Array(this.tokens.length);
            amounts[0] = this.swapAmount;
            for (let i = 0; i < this.pools.length; i++) {
                const pool = this.pools[i];
                const outputAmount = pool.swapGivenIn(this.tokens[i], this.tokens[i + 1], amounts[i]);
                amounts[i + 1] = outputAmount;
                printPath.push({
                    pool: pool.id,
                    input: amounts[i].amount.toString() + ' ' + this.tokens[i].symbol,
                    output: outputAmount.amount.toString() + ' ' + this.tokens[i + 1].symbol,
                });
            }
            console.table(printPath);
        }
    }
}
//# sourceMappingURL=path.js.map