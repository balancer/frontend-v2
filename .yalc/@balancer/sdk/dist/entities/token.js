export class Token {
    constructor(chainId, address, decimals, symbol, name) {
        this.chainId = chainId;
        this.address = address.toLowerCase();
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
    }
    isEqual(token) {
        return this.chainId === token.chainId && this.address === token.address;
    }
}
//# sourceMappingURL=token.js.map