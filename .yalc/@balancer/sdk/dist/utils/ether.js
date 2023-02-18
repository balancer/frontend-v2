export const unsafeFastParseEther = (value) => {
    return unsafeFastParseUnits(value, 18);
};
export const unsafeFastParseUnits = (value, decimals) => {
    const parts = value.split('.');
    parts[0] = parts[0] || '';
    parts[1] = parts[1] || '';
    const zerosToAdd = decimals - parts[1].length;
    let etherValue = `${parts[0] !== '0' ? parts[0] : ''}${parts[1]}`;
    for (let i = 0; i < zerosToAdd; i++) {
        etherValue += '0';
    }
    return BigInt(etherValue);
};
//# sourceMappingURL=ether.js.map