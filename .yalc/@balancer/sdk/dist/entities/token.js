export class Token {
    constructor(chainId, address, decimals, symbol, name, wrapped) {
        this.chainId = chainId;
        this.address = address.toLowerCase();
        this.decimals = decimals;
        this.symbol = symbol;
        this.name = name;
        this.isNative =
            this.address === '0x0000000000000000000000000000000000000000' ? true : false;
        if (wrapped) {
            this.wrapped = wrapped.toLowerCase();
        }
        else {
            this.wrapped = address.toLowerCase();
        }
    }
    isEqual(token) {
        return this.chainId === token.chainId && this.address === token.address;
    }
}
//# sourceMappingURL=token.js.map