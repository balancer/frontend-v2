export class Token {
    constructor(chainId, address, decimals, symbol, name, wrapped, isNative) {
        this.chainId = chainId;
        this.address = address.toLowerCase();
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
        this.isNative = isNative || false;
        if (wrapped) {
            this.wrapped = wrapped.toLowerCase();
        }
        else {
            if (this.isNative)
                throw new Error('Native assets must have a wrapped address');
            this.wrapped = address.toLowerCase();
        }
    }
    isEqual(token) {
        return this.chainId === token.chainId && this.address === token.address;
    }
}
//# sourceMappingURL=token.js.map